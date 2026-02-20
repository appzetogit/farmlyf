import axios from 'axios';

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

class ShiprocketService {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    this.pickupPostcode = null;
    this.pickupPostcodeFetchedAt = null;
  }

  getDefaultDimensions() {
    return {
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    };
  }

  parseWeightToKg(weight) {
    if (!weight) return 0;

    const normalized = String(weight).trim().toLowerCase();
    const match = normalized.match(/([\d.]+)\s*([a-z]+)/);

    if (!match) return 0;

    const value = Number(match[1]);
    if (!Number.isFinite(value) || value <= 0) return 0;

    const unit = match[2];
    if (unit === 'kg' || unit === 'kgs' || unit === 'kilogram' || unit === 'kilograms') {
      return value;
    }
    if (unit === 'g' || unit === 'gm' || unit === 'gms' || unit === 'gram' || unit === 'grams') {
      return value / 1000;
    }
    if (unit === 'mg' || unit === 'milligram' || unit === 'milligrams') {
      return value / 1000000;
    }

    return 0;
  }

  buildOrderItems(items = []) {
    let totalWeightKg = 0;

    const orderItems = items.map((item, index) => {
      const nameSuffix = item.weight ? ` (${item.weight})` : '';
      const name = `${item.name || 'Item'}${nameSuffix}`;

      const skuBase = item.sku || item.id || item.productId;
      const sku = item.productId && item.id && item.productId !== item.id
        ? `${item.productId}-${item.id}`
        : (skuBase || `item-${index + 1}`);

      const units = item.qty || 1;
      const sellingPrice = Number(item.price) || 0;
      const discount = Number(item.discount) || 0;

      const itemWeightKg = this.parseWeightToKg(item.weight);
      if (itemWeightKg > 0) {
        totalWeightKg += itemWeightKg * units;
      }

      return {
        name,
        sku,
        units,
        selling_price: sellingPrice,
        discount,
        tax: item.tax,
        hsn: item.hsn,
      };
    });

    return { orderItems, totalWeightKg };
  }

  getFallbackShipping(orderAmount = 0, reason = 'fallback_rate') {
    const freeAbove = Number(process.env.FREE_SHIPPING_ABOVE || 1500);
    const flatCharge = Number(process.env.FLAT_SHIPPING_CHARGE || 99);
    const safeAmount = Number(orderAmount || 0);
    const shippingCharge = safeAmount >= freeAbove ? 0 : flatCharge;

    return {
      source: 'fallback',
      reason,
      shippingCharge,
      courierName: shippingCharge === 0 ? 'Free Shipping Offer' : 'Standard Shipping',
      estimatedDays: null,
      serviceable: true,
      currency: 'INR'
    };
  }

  /**
   * Check if Shiprocket credentials are configured
   */
  isConfigured() {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;
    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;

    // Check if credentials exist and are not placeholders
    return email && 
           password && 
           pickupLocation &&
           !email.includes('your_') &&
           !password.includes('your_') &&
           !pickupLocation.includes('your_');
  }

  /**
   * Authenticate with Shiprocket and get JWT token
   * Token is valid for 10 days (240 hours)
   */
  async authenticate() {
    // Check if Shiprocket is configured
    if (!this.isConfigured()) {
      throw new Error('Shiprocket credentials not configured. Please update .env file.');
    }

    try {
      // Check if we have a valid token
      if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.token;
      }

      const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      });

      this.token = response.data.token;
      // Set expiry to 9 days to refresh before actual expiry
      this.tokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000);

      return this.token;
    } catch (error) {
      console.error('Shiprocket Authentication Error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Shiprocket');
    }
  }

  /**
   * Get headers with authentication token
   */
  async getHeaders() {
    const token = await this.authenticate();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async resolvePickupPostcode(headers = null) {
    const envPostcode = String(process.env.SHIPROCKET_PICKUP_PINCODE || '').trim();
    if (/^\d{6}$/.test(envPostcode)) {
      return envPostcode;
    }

    const cacheAgeMs = 60 * 60 * 1000; // 1 hour
    if (this.pickupPostcode && this.pickupPostcodeFetchedAt && (Date.now() - this.pickupPostcodeFetchedAt) < cacheAgeMs) {
      return this.pickupPostcode;
    }

    try {
      const authHeaders = headers || await this.getHeaders();
      const response = await axios.get(`${SHIPROCKET_BASE_URL}/settings/company/pickup`, { headers: authHeaders });
      const pickupLocationName = String(process.env.SHIPROCKET_PICKUP_LOCATION || '').trim().toLowerCase();
      const addresses = response.data?.data?.shipping_address || response.data?.data || [];

      const matchAddress = addresses.find((address) => {
        const byLocation = String(address?.pickup_location || '').trim().toLowerCase();
        const byCode = String(address?.pickup_code || '').trim().toLowerCase();
        return pickupLocationName && (byLocation === pickupLocationName || byCode === pickupLocationName);
      }) || addresses[0];

      const resolved = String(
        matchAddress?.pin_code ||
        matchAddress?.pincode ||
        matchAddress?.postal_code ||
        ''
      ).trim();

      if (/^\d{6}$/.test(resolved)) {
        this.pickupPostcode = resolved;
        this.pickupPostcodeFetchedAt = Date.now();
        return resolved;
      }
    } catch (error) {
      console.error('Shiprocket Pickup Resolve Error:', error.response?.data || error.message);
    }

    return '';
  }

  /**
   * Create order in Shiprocket
   * @param {Object} orderData - Order details from our database
   * @returns {Object} Shiprocket order response
   */
  async createOrder(orderData) {
    try {
      const headers = await this.getHeaders();
      const defaults = this.getDefaultDimensions();
      const { orderItems, totalWeightKg } = this.buildOrderItems(orderData.items || []);

      // Transform our order data to Shiprocket format
      const shiprocketOrder = {
        order_id: orderData.id,
        order_date: new Date(orderData.date).toISOString().split('T')[0], // yyyy-mm-dd
        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,
        channel_id: '', // Will use default custom channel
        comment: `Order from ${orderData.paymentMethod.toUpperCase()}`,
        billing_customer_name: orderData.shippingAddress.fullName,
        billing_last_name: '',
        billing_address: orderData.shippingAddress.address,
        billing_city: orderData.shippingAddress.city,
        billing_pincode: orderData.shippingAddress.pincode,
        billing_state: orderData.shippingAddress.state,
        billing_country: 'India',
        billing_email: orderData.userEmail || 'customer@farmlyf.com',
        billing_phone: orderData.shippingAddress.phone,
        shipping_is_billing: true,
        order_items: orderItems,
        payment_method: orderData.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
        sub_total: orderData.amount,
        length: defaults.length, // Default dimensions in cm
        breadth: defaults.breadth,
        height: defaults.height,
        weight: totalWeightKg > 0 ? Number(totalWeightKg.toFixed(3)) : defaults.weight, // Default weight in kg
      };

      const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/orders/create/adhoc`,
        shiprocketOrder,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket Order Creation Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create order in Shiprocket');
    }
  }

  /**
   * Get shipping quote for checkout
   * @param {Object} payload
   * @param {String|Number} payload.deliveryPincode
   * @param {String} payload.paymentMethod - cod | online
   * @param {Array} payload.items
   * @param {Number} payload.orderAmount
   * @returns {Object}
   */
  async getShippingQuote(payload = {}) {
    const {
      deliveryPincode,
      paymentMethod = 'cod',
      items = [],
      orderAmount = 0,
      packageDimensions = {}
    } = payload;

    const normalizedDeliveryPincode = String(deliveryPincode || '').trim();
    if (!/^\d{6}$/.test(normalizedDeliveryPincode)) {
      throw new Error('A valid 6-digit delivery pincode is required');
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('At least one cart item is required');
    }

    const defaults = this.getDefaultDimensions();
    const freeAbove = Number(process.env.FREE_SHIPPING_ABOVE || 1500);
    const { totalWeightKg } = this.buildOrderItems(items);
    const weight = totalWeightKg > 0 ? Number(totalWeightKg.toFixed(3)) : defaults.weight;
    const length = Number(packageDimensions.length || defaults.length);
    const breadth = Number(packageDimensions.breadth || defaults.breadth);
    const height = Number(packageDimensions.height || defaults.height);
    if (!this.isConfigured()) {
      return {
        ...this.getFallbackShipping(orderAmount, 'shiprocket_not_configured'),
        request: {
          deliveryPincode: normalizedDeliveryPincode,
          paymentMethod,
          weight,
          length,
          breadth,
          height
        }
      };
    }

    try {
      const headers = await this.getHeaders();
      const pickupPostcode = await this.resolvePickupPostcode(headers);
      if (!pickupPostcode) {
        return {
          ...this.getFallbackShipping(orderAmount, 'missing_pickup_pincode'),
          request: {
            deliveryPincode: normalizedDeliveryPincode,
            paymentMethod,
            weight,
            length,
            breadth,
            height
          }
        };
      }

      const params = {
        pickup_postcode: pickupPostcode,
        delivery_postcode: normalizedDeliveryPincode,
        cod: paymentMethod === 'cod' ? 1 : 0,
        weight,
        declared_value: Math.max(Number(orderAmount || 0), 1),
        length,
        breadth,
        height
      };

      const response = await axios.get(`${SHIPROCKET_BASE_URL}/courier/serviceability/`, {
        headers,
        params
      });

      const companies = response.data?.data?.available_courier_companies || [];
      if (!companies.length) {
        return {
          ...this.getFallbackShipping(orderAmount, 'no_courier_available'),
          serviceable: false,
          availableCourierCount: 0,
          request: params
        };
      }

      const pickCheapest = (currentBest, company) => {
        const currentRate = Number(currentBest?.rate ?? currentBest?.freight_charge ?? Infinity);
        const companyRate = Number(company?.rate ?? company?.freight_charge ?? Infinity);
        return companyRate < currentRate ? company : currentBest;
      };

      const bestCourier = companies.reduce(pickCheapest, null);
      const shippingCharge = Number(bestCourier?.rate ?? bestCourier?.freight_charge ?? 0);
      const estimatedDays = Number(bestCourier?.estimated_delivery_days || 0) || null;
      const freeShippingApplied = Number(orderAmount || 0) >= freeAbove;

      return {
        source: 'shiprocket',
        serviceable: true,
        shippingCharge: freeShippingApplied ? 0 : (Number.isFinite(shippingCharge) ? shippingCharge : 0),
        courierName: bestCourier?.courier_name || null,
        courierId: bestCourier?.courier_company_id || null,
        estimatedDays,
        weight,
        availableCourierCount: companies.length,
        freeShippingApplied,
        currency: 'INR',
        request: params
      };
    } catch (error) {
      console.error('Shiprocket Shipping Quote Error:', error.response?.data || error.message);
      return {
        ...this.getFallbackShipping(orderAmount, 'shiprocket_quote_error'),
        serviceable: true,
        request: {
          deliveryPincode: normalizedDeliveryPincode,
          paymentMethod,
          weight,
          length,
          breadth,
          height
        }
      };
    }
  }

  /**
   * Assign AWB (Air Waybill) number to order
   * @param {Number} shipmentId - Shiprocket shipment ID
   * @param {Number} courierId - Optional courier company ID
   * @returns {Object} AWB assignment response
   */
  async assignAWB(shipmentId, courierId = null) {
    try {
      const headers = await this.getHeaders();

      const payload = {
        shipment_id: shipmentId,
      };

      if (courierId) {
        payload.courier_id = courierId;
      }

      const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/courier/assign/awb`,
        payload,
        { headers }
      );

      // Log the full response for debugging
      console.log('Shiprocket AWB Response:', JSON.stringify(response.data, null, 2));

      // Log successful AWB assignment
      if (response.data?.response?.data?.awb_code) {
        console.log(`AWB assigned for shipment ${shipmentId}: ${response.data.response.data.awb_code}`);
      }

      return response.data;
    } catch (error) {
      const errorDetails = error.response?.data || error.message;
      console.error('Shiprocket AWB Assignment Error:', errorDetails);
      throw new Error(errorDetails?.message || 'Failed to assign AWB');
    }
  }

  /**
   * Generate pickup request for shipment
   * @param {Number} shipmentId - Shiprocket shipment ID
   * @returns {Object} Pickup generation response
   */
  async generatePickup(shipmentId) {
    try {
      const headers = await this.getHeaders();

      const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/courier/generate/pickup`,
        { shipment_id: shipmentId },
        { headers }
      );

      // Log successful pickup generation
      if (response.data) {
        console.log(`Pickup generated for shipment ${shipmentId}`);
      }

      return response.data;
    } catch (error) {
      const errorDetails = error.response?.data || error.message;
      console.error('Shiprocket Pickup Generation Error:', errorDetails);
      throw new Error(errorDetails?.message || 'Failed to generate pickup');
    }
  }

  /**
   * Track shipment by AWB code
   * @param {String} awbCode - AWB tracking number
   * @returns {Object} Tracking details
   */
  async trackShipment(awbCode) {
    try {
      const headers = await this.getHeaders();

      const response = await axios.get(
        `${SHIPROCKET_BASE_URL}/courier/track/awb/${awbCode}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket Tracking Error:', error.response?.data || error.message);
      throw new Error('Failed to track shipment');
    }
  }

  /**
   * Get tracking details by Shiprocket order ID
   * @param {Number} orderId - Shiprocket order ID
   * @returns {Object} Tracking details
   */
  async trackByOrderId(orderId) {
    try {
      const headers = await this.getHeaders();

      const response = await axios.get(
        `${SHIPROCKET_BASE_URL}/courier/track/shipment/${orderId}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket Tracking Error:', error.response?.data || error.message);
      throw new Error('Failed to track shipment');
    }
  }

  /**
   * Cancel order in Shiprocket
   * @param {Number} shiprocketOrderId - Shiprocket order ID
   * @returns {Object} Cancellation response
   */
  async cancelOrder(shiprocketOrderId) {
    try {
      const headers = await this.getHeaders();

      const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/orders/cancel`,
        { ids: [shiprocketOrderId] },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket Order Cancellation Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to cancel order in Shiprocket');
    }
  }

  /**
   * Create a return order in Shiprocket for reverse pickup
   * @param {Object} returnData - Return request details
   * @param {Object} originalOrder - Original order with shipping address
   * @returns {Object} Shiprocket return order response
   */
  async createReturnOrder(returnData, originalOrder) {
    try {
      const headers = await this.getHeaders();
      const defaults = this.getDefaultDimensions();
      const { orderItems, totalWeightKg } = this.buildOrderItems(returnData.items || []);

      // Transform to Shiprocket return order format
      const shiprocketReturnOrder = {
        order_id: returnData.id, // Our return ID
        order_date: new Date(returnData.requestDate || Date.now()).toISOString().split('T')[0],
        channel_id: '',
        pickup_customer_name: originalOrder.shippingAddress?.fullName || originalOrder.userName,
        pickup_last_name: '',
        pickup_address: originalOrder.shippingAddress?.address,
        pickup_city: originalOrder.shippingAddress?.city,
        pickup_state: originalOrder.shippingAddress?.state,
        pickup_country: 'India',
        pickup_pincode: originalOrder.shippingAddress?.pincode,
        pickup_email: originalOrder.userEmail || 'customer@farmlyf.com',
        pickup_phone: originalOrder.shippingAddress?.phone,
        pickup_isd_code: '91',
        shipping_customer_name: process.env.SHIPROCKET_SELLER_NAME || 'FarmlyF',
        shipping_last_name: '',
        shipping_address: process.env.SHIPROCKET_SELLER_ADDRESS || 'Warehouse Address',
        shipping_city: process.env.SHIPROCKET_SELLER_CITY || 'Mumbai',
        shipping_state: process.env.SHIPROCKET_SELLER_STATE || 'Maharashtra',
        shipping_country: 'India',
        shipping_pincode: process.env.SHIPROCKET_SELLER_PINCODE || '400001',
        shipping_email: process.env.SHIPROCKET_SELLER_EMAIL || 'returns@farmlyf.com',
        shipping_phone: process.env.SHIPROCKET_SELLER_PHONE || '9999999999',
        order_items: orderItems.map(item => ({
          ...item,
          qc_enable: true, // Enable quality check for returns
        })),
        payment_method: 'Prepaid', // Returns are always prepaid
        sub_total: returnData.refundAmount || returnData.items.reduce((sum, i) => sum + (i.price * i.qty), 0),
        length: defaults.length,
        breadth: defaults.breadth,
        height: defaults.height,
        weight: totalWeightKg > 0 ? Number(totalWeightKg.toFixed(3)) : defaults.weight,
      };

      const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/orders/create/return`,
        shiprocketReturnOrder,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket Return Order Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create return order in Shiprocket');
    }
  }
}

// Export singleton instance
export default new ShiprocketService();
