import Product from '../models/Product.js';
import { sendAdminLowStockNotification } from './notificationUtils.js';

/**
 * Validates if there is enough stock for the given order items.
 */
export const validateOrderStock = async (orderItems = []) => {
    const aggregatedItems = aggregateOrderItems(orderItems);

    for (const item of aggregatedItems) {
        const resolved = await resolveProductAndVariant(item);
        if (!resolved?.product) {
            return { ok: false, message: `Product not found for "${item.displayName}"` };
        }

        const { product, variantId } = resolved;

        if (product.variants?.length > 0) {
            if (!variantId) {
                return { ok: false, message: `Variant is required for "${product.name}"` };
            }

            const variant = product.variants.find(v => String(v.id) === String(variantId) || v.weight === variantId);
            if (!variant) {
                return { ok: false, message: `Variant not found for "${product.name}"` };
            }

            const available = Number(variant.stock || 0);
            if (available < item.qty) {
                return {
                    ok: false,
                    message: `Insufficient stock for "${product.name}" (${variant.weight || variant.id}). Available: ${available}, requested: ${item.qty}`
                };
            }
        } else {
            const available = Number(product.stock?.quantity || 0);
            if (available < item.qty) {
                return {
                    ok: false,
                    message: `Insufficient stock for "${product.name}". Available: ${available}, requested: ${item.qty}`
                };
            }
        }
    }

    return { ok: true };
};


/**
 * Aggregates order items by product and variant ID.
 * Handles cases where variantId might be missing but identifiable by weight or ID.
 */
export const aggregateOrderItems = (orderItems = []) => {
    const aggregated = new Map();

    for (const rawItem of orderItems) {
        const qty = Number(rawItem?.qty || 0);
        if (!Number.isFinite(qty) || qty <= 0) {
            throw new Error(`Invalid quantity for item "${rawItem?.name || rawItem?.id || 'unknown'}"`);
        }

        const productId = String(rawItem?.productId || rawItem?.id || '').trim();
        if (!productId) {
            throw new Error(`Missing product id for item "${rawItem?.name || 'unknown'}"`);
        }

        // Logic to determine variantId from either variantId field or rawItem.id if it differs from productId
        const variantIdCandidate = rawItem?.variantId
            ? String(rawItem.variantId)
            : (rawItem?.productId && rawItem?.id && String(rawItem.id) !== String(rawItem.productId))
                ? String(rawItem.id)
                : rawItem?.weight || null; // Fallback to weight if present

        const key = `${productId}::${variantIdCandidate || 'base'}`;
        if (!aggregated.has(key)) {
            aggregated.set(key, {
                productId,
                variantId: variantIdCandidate,
                qty: 0,
                displayName: rawItem?.name || productId
            });
        }
        aggregated.get(key).qty += qty;
    }

    return [...aggregated.values()];
};

/**
 * Resolves a product and its variant based on IDs.
 */
export const resolveProductAndVariant = async ({ productId, variantId }) => {
    let product = await Product.findOne({ id: productId });
    if (!product && variantId) {
        product = await Product.findOne({ 'variants.id': variantId });
    }
    if (!product) return null;

    let resolvedVariantId = variantId || null;
    
    // If we have variants but no specific variantId was passed, try to find a matching one
    if (!resolvedVariantId && product.variants?.length > 0) {
        // Some systems might use productId as variantId if there's only one
        const candidate = product.variants.find(v => String(v.id) === String(productId));
        if (candidate) {
            resolvedVariantId = String(candidate.id);
        } else if (variantId) {
             // Try to find by weight if variantId was actually a weight label
             const byWeight = product.variants.find(v => v.weight === variantId);
             if (byWeight) resolvedVariantId = String(byWeight.id);
        }
    }

    return { product, variantId: resolvedVariantId };
};

/**
 * Deducts stock for a list of order items.
 * Includes rollback logic for partial failure.
 */
export const deductStock = async (orderItems = []) => {
    const aggregatedItems = aggregateOrderItems(orderItems);
    const touchedProductIds = new Set();
    const appliedDeductions = [];

    try {
        for (const item of aggregatedItems) {
            const resolved = await resolveProductAndVariant(item);
            if (!resolved?.product) {
                throw new Error(`Product not found for "${item.displayName}"`);
            }

            const { product, variantId } = resolved;
            touchedProductIds.add(product.id);

            if (product.variants?.length > 0) {
                // Try to find variant by ID or Weight
                const variant = product.variants.find(v => String(v.id) === String(variantId) || v.weight === variantId);
                
                if (!variant) {
                    throw new Error(`Variant "${variantId}" not found for "${product.name}"`);
                }

                const updateResult = await Product.updateOne(
                    { id: product.id, 'variants.id': variant.id, 'variants.stock': { $gte: item.qty } },
                    { $inc: { 'variants.$.stock': -item.qty } }
                );

                if (!updateResult.modifiedCount) {
                    throw new Error(`Insufficient stock for "${product.name}" (${variant.weight || variant.id}). Available: ${variant.stock}, requested: ${item.qty}`);
                }

                appliedDeductions.push({ productId: product.id, variantId: variant.id, qty: item.qty });

                // Check for low stock alert
                const updatedProduct = await Product.findOne({ id: product.id });
                if (updatedProduct) {
                    const updatedVariant = updatedProduct.variants.find(v => String(v.id) === String(variant.id));
                    const threshold = updatedProduct.lowStockThreshold || 10;
                    if (updatedVariant && updatedVariant.stock <= threshold) {
                        try {
                            await sendAdminLowStockNotification(updatedProduct, variant.id);
                        } catch (notifyError) {
                            console.error('Failed to send low stock notification:', notifyError.message);
                        }
                    }
                }
            } else {
                const updateResult = await Product.updateOne(
                    { id: product.id, 'stock.quantity': { $gte: item.qty } },
                    { $inc: { 'stock.quantity': -item.qty } }
                );

                if (!updateResult.modifiedCount) {
                    throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock?.quantity || 0}, requested: ${item.qty}`);
                }

                appliedDeductions.push({ productId: product.id, variantId: null, qty: item.qty });

                // Check for low stock alert
                const updatedProduct = await Product.findOne({ id: product.id });
                if (updatedProduct) {
                    const threshold = updatedProduct.lowStockThreshold || 10;
                    if (updatedProduct.stock?.quantity <= threshold) {
                        try {
                            await sendAdminLowStockNotification(updatedProduct);
                        } catch (notifyError) {
                            console.error('Failed to send low stock notification:', notifyError.message);
                        }
                    }
                }
            }
        }
    } catch (error) {
        // Best-effort rollback
        for (const applied of appliedDeductions.reverse()) {
            if (applied.variantId) {
                await Product.updateOne(
                    { id: applied.productId, 'variants.id': applied.variantId },
                    { $inc: { 'variants.$.stock': applied.qty } }
                );
            } else {
                await Product.updateOne(
                    { id: applied.productId },
                    { $inc: { 'stock.quantity': applied.qty } }
                );
            }
        }
        throw error;
    }

    // Update inStock status for all affected products
    await updateInStockStatus(touchedProductIds);
};

/**
 * Restores stock for a list of order items (on cancellation).
 */
export const restockItems = async (orderItems = []) => {
    if (!orderItems || orderItems.length === 0) return;
    
    const aggregatedItems = aggregateOrderItems(orderItems);
    const touchedProductIds = new Set();

    for (const item of aggregatedItems) {
        try {
            const resolved = await resolveProductAndVariant(item);
            if (!resolved?.product) {
                console.error(`Product ${item.productId} not found for restocking`);
                continue;
            }

            const { product, variantId } = resolved;
            touchedProductIds.add(product.id);

            if (product.variants?.length > 0) {
                 // Try to find variant by ID or Weight
                 const variant = product.variants.find(v => String(v.id) === String(variantId) || v.weight === variantId);
                 
                if (variant) {
                    await Product.updateOne(
                        { id: product.id, 'variants.id': variant.id },
                        { $inc: { 'variants.$.stock': item.qty } }
                    );
                    console.log(`Restocked ${item.qty} for variant ${variant.id} of product ${product.id}`);
                } else {
                    console.error(`Variant ${variantId} not found for product ${product.id} during restocking`);
                }
            } else {
                await Product.updateOne(
                    { id: product.id },
                    { $inc: { 'stock.quantity': item.qty } }
                );
                console.log(`Restocked ${item.qty} for product ${product.id}`);
            }
        } catch (error) {
            console.error(`Error restocking item ${item.productId}:`, error.message);
        }
    }

    await updateInStockStatus(touchedProductIds);
};

/**
 * Helper to update inStock flag based on available quantity across variants or base product.
 */
const updateInStockStatus = async (productIds) => {
    for (const productId of productIds) {
        try {
            const product = await Product.findOne({ id: productId });
            if (!product) continue;

            const hasStock = product.variants?.length > 0
                ? product.variants.some(v => Number(v.stock || 0) > 0)
                : Number(product.stock?.quantity || 0) > 0;

            if (product.inStock !== hasStock) {
                product.inStock = hasStock;
                await product.save();
            }
        } catch (error) {
            console.error(`Error updating inStock status for ${productId}:`, error.message);
        }
    }
};

