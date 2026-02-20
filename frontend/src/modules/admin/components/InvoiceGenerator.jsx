import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useSetting } from "../../../hooks/useSettings";

/* ============================================
   INVOICE DISPLAY
============================================ */

export const InvoiceDisplay = React.forwardRef(
  ({ order, item, items, settings: apiSettings }, ref) => {
    if (!order) return null;

    // Specific seller requirements - prioritize apiSettings from DB
    const settings = {
        sellerName: apiSettings?.sellerName || "Farmlyf",
        sellerAddress: apiSettings?.sellerAddress || "123 E-com St, Digital City",
        companyOfficeAddress: apiSettings?.companyOfficeAddress || apiSettings?.sellerAddress || "123 E-com St, Digital City",
        gstNumber: apiSettings?.gstNumber || "123456789",
        panNumber: apiSettings?.panNumber || "LBCPS9976F",
        logoUrl: apiSettings?.logoUrl || "",
        signatureUrl: apiSettings?.signatureUrl || "",
        fssai: apiSettings?.fssai || "N/A"
    };

    const format = (n) => Number(n || 0).toFixed(2);

    // Robust list selection: items prop > item prop > order.items
    const list = (items && items.length > 0) 
      ? items 
      : (item ? [item] : (order?.items || []));

    const totalQty = list.reduce((a, b) => a + (b.qty || b.quantity || 1), 0);
    const subtotal = list.reduce((a, b) => a + (b.price * (b.qty || b.quantity || 1)), 0);
    const shipping = Number(order.deliveryCharges || 0);
    const discount = Number(order.discount || 0);
    const totalAmount = subtotal + shipping - discount;

    return (
      <div ref={ref} className="invoice-root">
        <style>{`
          .invoice-root {
            padding: 30px 40px;
            background: white;
            color: black;
            font-family: sans-serif;
            font-size: 9.5px;
            max-width: 195mm;
            margin: 0 auto;
            box-sizing: border-box;
          }
          .label {
            border: 1px solid black;
            width: 100%;
            max-width: 500px;
            margin: 0 auto 20px auto;
          }
          .label table {
            width: 100%;
            border-collapse: collapse;
          }
          .label th, .label td {
            border: 1px solid black;
            padding: 3px 5px;
            text-align: left;
            vertical-align: top;
          }
          .label .brand {
            font-size: 15px;
            font-weight: bold;
          }
          .label .b2 {
            width: 35px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid black;
          }
          .label-footer {
            display: flex;
            justify-content: space-between;
            padding: 3px 5px;
            font-size: 8px;
            font-weight: bold;
          }
          .dashed {
            border: none;
            border-top: 1px dashed #999;
            margin: 20px 0;
            width: 100%;
          }
          .tax-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            border-top: 2px solid black;
            padding-top: 8px;
          }
          .tax-header-item {
            flex: 1;
            padding-right: 5px;
          }
          .addr-grid {
            display: grid;
            grid-template-cols: 1.2fr 1fr 1.1fr;
            gap: 15px;
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          .addr-block {
            line-height: 1.3;
          }
          .addr-title {
            font-weight: bold;
            font-size: 10px;
            margin-bottom: 3px;
            display: block;
            text-transform: uppercase;
            color: #444;
          }
          .tax-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5px;
            border: 1px solid #ccc;
          }
          .tax-table th, .tax-table td {
            border: 1px solid #ccc;
            padding: 5px 4px;
            text-align: left;
          }
          .tax-table th {
            font-weight: bold;
            background: #fcfcfc;
          }
          .text-right { text-align: right !important; }
          .text-center { text-align: center !important; }
          .font-bold { font-weight: bold; }
          
          @media print {
            @page { 
              size: A4; 
              margin: 10mm; 
            }
            body { -webkit-print-color-adjust: exact; padding: 0; margin: 0; overflow: visible !important; }
            .invoice-root { 
              padding: 5mm 0;
              max-width: none;
              overflow: visible !important;
            }
            .dashed { margin: 15px 0; }
          }
        `}</style>

        {/* ================= SHIPPING LABEL ================= */}
        <div className="label">
          <table>
            <thead>
              <tr>
                <th style={{ width: "40px", textAlign: "center", fontSize: "14px" }}>STD</th>
                <th>
                  <div style={{ fontSize: "8px" }}>E-Kart Logistics</div>
                  <div style={{ fontSize: "10px", fontWeight: "bold" }}>{order.displayId || order.id || order._id}</div>
                </th>
                <th style={{ width: "100px" }}>
                  <div style={{ fontSize: "8px" }}>↑FRAGILE</div>
                  <div style={{ fontSize: "10px", fontWeight: "bold" }}>PREPAID</div>
                </th>
                <th style={{ width: "30px", fontSize: "18px", textAlign: "center" }}>E</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" style={{ padding: "8px 5px" }}>
                   <div style={{ fontSize: "9px", marginBottom: "3px" }}>Ordered through</div>
                   <div className="brand">Farmlyf <span style={{ fontSize: "14px", transform: "scaleX(-1)", display: "inline-block" }}>f</span></div>
                </td>
              </tr>
              <tr>
                <td colSpan="4" className="addr">
                  <div style={{ marginBottom: "3px" }}><b>Shipping/Customer address:</b></div>
                  <div>Name: <b>{order.shippingAddress?.name || order.shippingAddress?.fullName || order.address?.name || order.user?.name || 'Customer Name'}</b></div>
                  <div style={{ maxWidth: "250px" }}>{order.address?.line || order.shippingAddress?.address || order.shippingAddress?.street || 'Address Not Available'}</div>
                  <div>{order.address?.city || order.shippingAddress?.city || 'N/A'}, {order.address?.state || order.shippingAddress?.state || 'N/A'} - <b>{order.address?.pincode || order.shippingAddress?.pincode || order.shippingAddress?.postalCode || 'N/A'}</b>, IN-WB</div>
                </td>
              </tr>
              <tr style={{ height: "35px" }}>
                <td colSpan="2" style={{ borderRight: "1px solid black" }}>
                  <div>HBD: {new Date(order.date || order.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: '2-digit' })}</div>
                  <div>CPD: {new Date().toLocaleDateString("en-IN", { day: '2-digit', month: '2-digit' })}</div>
                </td>
                <td colSpan="2">
                  <div style={{ fontSize: "8px" }}>Sold By:<b>{settings.sellerName}</b>, {settings.sellerAddress}</div>
                </td>
              </tr>
              <tr>
                <td colSpan="4">
                  <b>GSTIN: {settings.gstNumber}</b>
                </td>
              </tr>
              <tr>
                <th className="text-center" style={{ width: "20px" }}>#</th>
                <th style={{ fontSize: "8px" }}><b>SKU ID | Description</b></th>
                <th className="text-center" style={{ width: "40px" }}><b>QTY</b></th>
                <th style={{ width: "40px" }}></th>
              </tr>
              {list.map((i, idx) => (
                <tr key={idx} style={{ height: "45px" }}>
                  <td className="text-center">{idx + 1}</td>
                  <td><div className="font-bold">{i.name}</div></td>
                  <td className="text-center font-bold">{i.qty || i.quantity}</td>
                  <td></td>
                </tr>
              ))}
              <tr>
                <td colSpan="3" style={{ padding: "6px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "bold" }}>FMPP{String(order.displayId || order.id || order._id).slice(0, 8).toUpperCase()}</div>
                </td>
                <td className="b2">B2</td>
              </tr>
            </tbody>
          </table>
          <div className="label-footer">
            <span>Not for resale.</span>
            <span>Printed at {new Date().getHours()}{String(new Date().getMinutes()).padStart(2, '0')} hrs, {new Date().toLocaleDateString("en-IN", { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
          </div>
        </div>

        <hr className="dashed" />

        {/* ================= TAX INVOICE ================= */}
        <div className="tax">
          <div className="tax-header">
            <div className="tax-header-item">
              {settings.logoUrl && (
                  <img src={settings.logoUrl} alt="Store Logo" style={{ height: "40px", marginBottom: "5px", objectFit: "contain", maxWidth: "120px" }} />
              )}
              <h2 style={{ fontSize: "12px", margin: "0 0 3px 0" }}>Tax Invoice</h2>
            </div>
            <div className="tax-header-item">
              <span style={{ fontSize: "10px", color: "#666", textTransform: "uppercase", fontWeight: "bold" }}>Order ID</span><br />
              <b style={{ fontSize: "14px" }}>{order.displayId || order.id || order._id}</b><br />
              <span style={{ fontSize: "7px" }}>{new Date(order.date || order.createdAt).toLocaleString()}</span>
            </div>
            <div className="tax-header-item">
              Invoice: <b>INV-{String(order.displayId || order.id || order._id).toUpperCase()}</b><br />
              <span style={{ fontSize: "7px" }}>{new Date().toLocaleString()}</span>
            </div>
            <div className="tax-header-item text-right">
              GST: {settings.gstNumber}<br />
              PAN: {settings.panNumber}
            </div>
          </div>

          <div className="addr-grid">
            <div className="addr-block">
              <span className="addr-title">Sold By</span>
              <div className="font-bold">{settings.sellerName}</div>
              <div style={{ fontSize: "8.5px" }}>{settings.companyOfficeAddress}</div>
              <div style={{ marginTop: "3px" }}>GST: {settings.gstNumber}</div>
            </div>
            <div className="addr-block">
              <span className="addr-title">Billing Address</span>
              <div className="font-bold">{order.shippingAddress?.name || order.shippingAddress?.fullName || order.address?.name || order.user?.name || 'Customer'}</div>
              <div>{order.address?.line || order.shippingAddress?.address || order.shippingAddress?.street || 'N/A'}</div>
              <div>{order.address?.city || order.shippingAddress?.city || 'N/A'}, {order.address?.state || order.shippingAddress?.state || 'N/A'} - {order.address?.pincode || order.shippingAddress?.pincode || order.shippingAddress?.postalCode || ''}</div>
            </div>
            <div className="addr-block">
              <span className="addr-title">Shipping Address</span>
              <div className="font-bold">{order.shippingAddress?.name || order.shippingAddress?.fullName || order.address?.name || order.user?.name || 'Customer'}</div>
              <div>{order.address?.line || order.shippingAddress?.address || order.shippingAddress?.street || 'N/A'}</div>
              <div>{order.address?.city || order.shippingAddress?.city || 'N/A'}, {order.address?.state || order.shippingAddress?.state || 'N/A'} - {order.address?.pincode || order.shippingAddress?.pincode || order.shippingAddress?.postalCode || ''}</div>
            </div>
          </div>

          <table className="tax-table">
            <thead>
              <tr style={{ background: "#eee" }}>
                <th>Product</th>
                <th style={{ width: "150px" }}>Description</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Gross</th>
                <th className="text-right">Disc.</th>
                <th className="text-right">Taxable</th>
                <th className="text-right">IGST</th>
                <th className="text-right">CESS</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {list.map((i, idx) => {
                const gross = i.price * (i.qty || i.quantity || 1);
                const taxable = gross / 1.18;
                const tax = gross - taxable;

                return (
                  <tr key={idx}>
                    <td>
                      <div><b>{i.name}</b></div>
                      {i.serialNumber && <div style={{ fontSize: "7px", color: "#666" }}>IMEI/SN: {i.serialNumber}</div>}
                    </td>
                    <td>HSN: 90029000 | 18.00% | 0%</td>
                    <td className="text-center">{i.qty || i.quantity}</td>
                    <td className="text-right">{format(gross)}</td>
                    <td className="text-right">0.00</td>
                    <td className="text-right">{format(taxable)}</td>
                    <td className="text-right">{format(tax)}</td>
                    <td className="text-right">0.00</td>
                    <td className="text-right font-bold">{format(gross)}</td>
                  </tr>
                );
              })}
              {shipping > 0 && (
                <tr>
                  <td colSpan="2"><b>Shipping Charges</b></td>
                  <td className="text-center">1</td>
                  <td className="text-right">{format(shipping)}</td>
                  <td className="text-right">0.00</td>
                  <td className="text-right">{format(shipping)}</td>
                  <td className="text-right">0.00</td>
                  <td className="text-right">0.00</td>
                  <td className="text-right"><b>{format(shipping)}</b></td>
                </tr>
              )}
              {discount > 0 && (
                <tr style={{ color: "green" }}>
                  <td colSpan="2"><b>Discount</b></td>
                  <td className="text-center">1</td>
                  <td className="text-right">-{format(discount)}</td>
                  <td className="text-right">0.00</td>
                  <td className="text-right">-{format(discount)}</td>
                  <td className="text-right">0.00</td>
                  <td className="text-right">0.00</td>
                  <td className="text-right"><b>-{format(discount)}</b></td>
                </tr>
              )}
              <tr style={{ background: "#f5f5f5", fontWeight: "bold" }}>
                <td colSpan="2">TOTAL QTY: {totalQty}</td>
                <td colSpan="6" className="text-right">TOTAL PRICE:</td>
                <td className="text-right">₹{format(totalAmount)}</td>
              </tr>
            </tbody>
          </table>
          <div className="text-right" style={{ fontSize: "7px", marginTop: "2px", fontStyle: "italic", color: "#666" }}>
             All values are in INR
          </div>

          <div style={{ marginTop: "25px", display: "flex", justifyBetween: "space-between", alignItems: "flex-end" }}>
            <div style={{ fontSize: "8px", lineHeight: "1.5", color: "#444" }}>
              <div style={{ marginBottom: "10px" }}>
                <b>Declaration</b><br />
                The goods sold are intended for end user consumption and not for resale.
              </div>
              <b>Seller Registered Address:</b><br />
              {settings.sellerName}, {settings.sellerAddress}<br />
              FSSAI: {settings.fssai || 'N/A'}
            </div>
            <div className="text-center" style={{ marginLeft: "auto", minWidth: "150px" }}>
              {settings.signatureUrl && (
                <img 
                  src={settings.signatureUrl} 
                  alt="Signature" 
                  style={{ height: "60px", width: "auto", margin: "0 auto 5px auto", display: "block", objectFit: "contain" }} 
                />
              )}
              <div style={{ borderTop: "1px solid black", paddingTop: "5px", fontSize: "9px", fontWeight: "bold", marginTop: "5px" }}>
                Authorized Signature
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", fontSize: "9px", fontWeight: "bold", borderTop: "1px solid #eee", paddingTop: "10px" }}>
             <span>E. & O.E.</span>
             <span>Ordered Through Farmlyf <span style={{ border: "1px solid black", padding: "0 1px", transform: "scaleX(-1)", display: "inline-block", fontSize: "8px" }}>f</span></span>
          </div>
        </div>
      </div>
    );
  }
);

/* ============================================
   INVOICE GENERATOR WRAPPER
============================================ */

const InvoiceGenerator = ({ order, item, items, settings, customTrigger }) => {
  const componentRef = useRef(null);
  const { data: invoiceSettings } = useSetting('invoice_settings');

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  if (!order) return null;

  const trigger = customTrigger ? (
    React.cloneElement(customTrigger, { 
      onClick: (e) => {
        e.preventDefault();
        handlePrint();
      }
    })
  ) : (
    <button
      onClick={handlePrint}
      className="bg-black text-white px-4 py-2 rounded font-bold text-sm hover:bg-gray-800 transition-colors"
    >
      Print Invoice
    </button>
  );

  return (
    <>
      <div style={{ display: "none" }}>
        <InvoiceDisplay
          ref={componentRef}
          order={order}
          item={item}
          items={items}
          settings={settings || invoiceSettings?.value}
        />
      </div>
      {trigger}
    </>
  );
};

/* ============================================
   BULK INVOICE GENERATOR
============================================ */

export const BulkInvoiceGenerator = ({ orders, settings, customTrigger }) => {
  const componentRef = useRef(null);
  const { data: invoiceSettings } = useSetting('invoice_settings');

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  if (!orders || orders.length === 0) return null;

  const trigger = customTrigger ? (
    React.cloneElement(customTrigger, { 
      onClick: (e) => {
        e.preventDefault();
        handlePrint();
      }
    })
  ) : (
    <button
      onClick={handlePrint}
      className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
    >
      Print {orders.length} Invoices
    </button>
  );

  return (
    <>
      <div style={{ display: "none" }}>
        <div ref={componentRef}>
          {orders.map((order, index) => (
            <div key={order.id || order._id} style={{ pageBreakAfter: "always" }}>
              <InvoiceDisplay
                order={order}
                items={order.items || order.orderItems}
                settings={settings || invoiceSettings?.value}
              />
            </div>
          ))}
        </div>
      </div>
      {trigger}
    </>
  );
};

export default InvoiceGenerator;
