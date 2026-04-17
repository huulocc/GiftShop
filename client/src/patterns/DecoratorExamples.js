/**
 * EXAMPLE: Using Decorator Pattern with Products
 * This demonstrates how to apply dynamic discounts to products
 */

import { DiscountManager } from '../patterns/Decorator';

// ============================================
// Example 1: Basic Discount Application
// ============================================
export function exampleBasicDiscount() {
    console.log('=== Example 1: Basic Discount ===');

    const product = {
        id: 1,
        name: 'Enamel Mug',
        basePrice: 20.0,
    };

    // Create a discount manager with base price
    const priceManager = new DiscountManager(product.basePrice);

    // Apply a 20% discount with code
    priceManager.applyPercentageDiscount(20, 'SAVE20');

    console.log(priceManager.getPriceBreakdown());
    // Output:
    // {
    //   finalPrice: 16.00,
    //   description: "Price: $20.00 → Code "SAVE20" (20% OFF): -$4.00",
    //   appliedDiscounts: [...]
    // }
}

// ============================================
// Example 2: Multiple Discounts (Stacking)
// ============================================
export function exampleMultipleDiscounts() {
    console.log('=== Example 2: Multiple Discounts ===');

    // Loyalty member + Promotional code + Bundle discount
    const priceManager = new DiscountManager(100);

    priceManager
        .applyLoyaltyDiscount('gold') // 10% for gold member
        .applyPercentageDiscount(15, 'SUMMER2024'); // Additional 15% promotional

    console.log(priceManager.getPriceBreakdown());
    // Output shows both discounts applied
}

// ============================================
// Example 3: Real-world Product Discount
// ============================================
export function exampleRealWorldProduct() {
    console.log('=== Example 3: Real-world Product ===');

    const product = {
        id: 101,
        name: 'Birthstone Bracelet',
        basePrice: 45.99,
    };

    const manager = new DiscountManager(product.basePrice);

    // Customer has: Gold loyalty + Promo code + Buying 3 items
    manager
        .applyLoyaltyDiscount('gold')
        .applyPercentageDiscount(10, 'HOLIDAY');

    const breakdown = manager.getPriceBreakdown();

    console.log(`
    Product: ${product.name}
    Original: $${product.basePrice}
    Final Price: $${breakdown.finalPrice.toFixed(2)}
    You Save: $${(product.basePrice - breakdown.finalPrice).toFixed(2)}
    Breakdown:
    ${breakdown.description}
  `);
}

// ============================================
// Example 4: Bundle Discount with Quantity
// ============================================
export function exampleBundleDiscount() {
    console.log('=== Example 4: Bundle Discount ===');

    const manager = new DiscountManager(50);

    // Buy 3+ items, get 15% off
    manager.applyBundleDiscount({
        minQuantity: 3,
        percentage: 15,
        seasonName: 'Spring Sale',
    });

    console.log('Buying 2 items (no discount):', manager.getFinalPrice(2));
    console.log('Buying 3 items (with discount):', manager.getFinalPrice(3));
    console.log('Buying 5 items (with discount):', manager.getFinalPrice(5));
}

// ============================================
// Example 5: Fixed Amount Discount
// ============================================
export function exampleFixedDiscount() {
    console.log('=== Example 5: Fixed Amount Discount ===');

    const manager = new DiscountManager(75);

    // Apply $15 off with code
    manager.applyFixedDiscount(15, 'FIRST15');

    const breakdown = manager.getPriceBreakdown();
    console.log(`
    Original: $75.00
    Code Applied: FIRST15
    Final: $${breakdown.finalPrice.toFixed(2)}
  `);
}

// ============================================
// React Component Example
// ============================================
export function DiscountedProductCard({ product }) {
    // This would be a React component using the decorator pattern

    const calculatePrice = (discounts = {}) => {
        const manager = new DiscountManager(product.price);

        if (discounts.loyaltyTier) {
            manager.applyLoyaltyDiscount(discounts.loyaltyTier);
        }

        if (discounts.couponCode) {
            manager.applyPercentageDiscount(discounts.percentage, discounts.couponCode);
        }

        if (discounts.bundleMinQty) {
            manager.applyBundleDiscount({
                minQuantity: discounts.bundleMinQty,
                percentage: discounts.bundlePercentage,
                seasonName: discounts.seasonName,
            });
        }

        return manager.getPriceBreakdown();
    };

    return {
        calculatePrice,
        displayPrice: (discounts) => {
            const breakdown = calculatePrice(discounts);
            return {
                original: product.price,
                final: breakdown.finalPrice,
                savings: product.price - breakdown.finalPrice,
                breakdown: breakdown.description,
            };
        },
    };
}

// ============================================
// Validator: Check if coupon is applicable
// ============================================
export function validateCouponCode(couponCode, product, userTier) {
    const coupons = {
        SAVE20: { percentage: 20, minPrice: 15 },
        SAVE30: { percentage: 30, minPrice: 50 },
        FIRST15: { fixedAmount: 15, minPrice: 30 },
        LOYALTY: { loyaltyOnly: true },
    };

    const coupon = coupons[couponCode];
    if (!coupon) {
        return { valid: false, error: 'Invalid coupon code' };
    }

    if (coupon.minPrice && product.price < coupon.minPrice) {
        return {
            valid: false,
            error: `Minimum purchase of $${coupon.minPrice} required`,
        };
    }

    if (coupon.loyaltyOnly && userTier === 'none') {
        return { valid: false, error: 'This coupon is for loyalty members only' };
    }

    return { valid: true, coupon };
}

// Run all examples
export function runAllExamples() {
    exampleBasicDiscount();
    console.log('\n');
    exampleMultipleDiscounts();
    console.log('\n');
    exampleRealWorldProduct();
    console.log('\n');
    exampleBundleDiscount();
    console.log('\n');
    exampleFixedDiscount();
}
