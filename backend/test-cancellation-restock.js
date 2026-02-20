import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Order from './models/Order.js';
import { restockItems } from './utils/stockUtils.js';

dotenv.config({ path: './backend/.env' });

async function runVerification() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/farmlyf');
        console.log('Connected to MongoDB');

        // 1. Test Base Product Restock
        console.log('\n--- Testing Base Product Restock ---');
        const productId = 'test-prod-' + Date.now();
        const initialStock = 10;
        const product = new Product({
            id: productId,
            name: 'Test Product',
            slug: 'test-product-' + Date.now(),
            stock: { quantity: initialStock },
            inStock: true
        });
        await product.save();
        
        const orderQty = 3;
        const items = [{ productId: productId, qty: orderQty, name: 'Test Product', price: 100 }];
        await restockItems(items);
        
        const updatedProduct = await Product.findOne({ id: productId });
        console.log(`Base Product Stock after restock: ${updatedProduct.stock.quantity}`);
        if (updatedProduct.stock.quantity === initialStock + orderQty) {
            console.log('✅ Base restock successful!');
        } else {
            console.error('❌ Base restock failed!');
        }

        // 2. Test Variant Product Restock
        console.log('\n--- Testing Variant Product Restock ---');
        const variantProductId = 'test-var-' + Date.now();
        const variantId = 'v1';
        const initialVarStock = 5;
        const varProduct = new Product({
            id: variantProductId,
            name: 'Variant Product',
            slug: 'variant-product-' + Date.now(),
            variants: [
                { id: variantId, weight: '500g', stock: initialVarStock, price: 200 }
            ],
            inStock: true
        });
        await varProduct.save();

        const varOrderQty = 2;
        // Test with variantId
        const varItems = [{ productId: variantProductId, variantId: variantId, qty: varOrderQty }];
        await restockItems(varItems);
        
        let updatedVarProduct = await Product.findOne({ id: variantProductId });
        console.log(`Variant Stock after restock (by ID): ${updatedVarProduct.variants[0].stock}`);
        
        // Test with weight as fallback
        const weightItems = [{ productId: variantProductId, weight: '500g', qty: varOrderQty }];
        await restockItems(weightItems);
        
        updatedVarProduct = await Product.findOne({ id: variantProductId });
        console.log(`Variant Stock after restock (by weight): ${updatedVarProduct.variants[0].stock}`);

        if (updatedVarProduct.variants[0].stock === initialVarStock + varOrderQty * 2) {
            console.log('✅ Variant restock successful!');
        } else {
            console.error('❌ Variant restock failed!');
        }

        // 3. Cleanup
        await Product.deleteOne({ id: productId });
        await Product.deleteOne({ id: variantProductId });
        console.log('\nCleaned up test data');

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

runVerification();
