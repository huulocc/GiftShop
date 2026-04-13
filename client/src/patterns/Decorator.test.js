/**
 * Unit Tests for Decorator Pattern (Discount System)
 * Run with: npm test
 * Run specific test: npm test Decorator.test.js
 */

import {
    PriceComponent,
    PercentageDiscount,
    FixedDiscount,
    BundleDiscount,
    LoyaltyDiscount,
    DiscountManager,
} from './Decorator';

describe('Decorator Pattern - Discount System', () => {
    // =============================================
    // Test PriceComponent (Base)
    // =============================================

    describe('PriceComponent', () => {
        test('should create a PriceComponent with correct price', () => {
            const price = new PriceComponent(100);
            expect(price.getPrice()).toBe(100);
        });

        test('should format price correctly in description', () => {
            const price = new PriceComponent(99.99);
            expect(price.getDescription()).toBe('Price: $99.99');
        });

        test('should handle decimal prices', () => {
            const price = new PriceComponent(19.99);
            expect(price.getPrice()).toBe(19.99);
        });

        test('should convert string price to number', () => {
            const price = new PriceComponent('50.00');
            expect(price.getPrice()).toBe(50);
        });
    });

    // =============================================
    // Test PercentageDiscount
    // =============================================

    describe('PercentageDiscount', () => {
        test('should apply 20% discount', () => {
            const base = new PriceComponent(100);
            const discounted = new PercentageDiscount(base, 20, 'SAVE20');

            expect(discounted.getPrice()).toBe(80);
        });

        test('should calculate savings correctly', () => {
            const base = new PriceComponent(100);
            const discounted = new PercentageDiscount(base, 25);

            expect(discounted.getSavings()).toBe(25);
        });

        test('should show discount code in description', () => {
            const base = new PriceComponent(100);
            const discounted = new PercentageDiscount(base, 20, 'SAVE20');
            const desc = discounted.getDescription();

            expect(desc).toContain('SAVE20');
            expect(desc).toContain('20%');
            expect(desc).toContain('$20.00');
        });

        test('should handle small percentages', () => {
            const base = new PriceComponent(1000);
            const discounted = new PercentageDiscount(base, 1);

            expect(discounted.getPrice()).toBe(990);
            expect(discounted.getSavings()).toBe(10);
        });

        test('should handle 100% discount (free)', () => {
            const base = new PriceComponent(50);
            const discounted = new PercentageDiscount(base, 100);

            expect(discounted.getPrice()).toBe(0);
        });
    });

    // =============================================
    // Test FixedDiscount
    // =============================================

    describe('FixedDiscount', () => {
        test('should apply fixed discount of $15', () => {
            const base = new PriceComponent(50);
            const discounted = new FixedDiscount(base, 15, 'FIRST15');

            expect(discounted.getPrice()).toBe(35);
        });

        test('should prevent negative prices', () => {
            const base = new PriceComponent(10);
            const discounted = new FixedDiscount(base, 20);

            expect(discounted.getPrice()).toBe(0);
        });

        test('should include discount code in description', () => {
            const base = new PriceComponent(100);
            const discounted = new FixedDiscount(base, 10, 'CODE100');
            const desc = discounted.getDescription();

            expect(desc).toContain('CODE100');
            expect(desc).toContain('$10.00');
        });

        test('should handle decimal discount amounts', () => {
            const base = new PriceComponent(99.99);
            const discounted = new FixedDiscount(base, 19.99);

            expect(discounted.getPrice()).toBeCloseTo(80.00, 2);
        });

        test('should work with string amount', () => {
            const base = new PriceComponent(100);
            const discounted = new FixedDiscount(base, '25');

            expect(discounted.getPrice()).toBe(75);
        });
    });

    // =============================================
    // Test LoyaltyDiscount
    // =============================================

    describe('LoyaltyDiscount', () => {
        test('should apply bronze level (no discount)', () => {
            const base = new PriceComponent(100);
            const discounted = new LoyaltyDiscount(base, 'bronze');

            expect(discounted.getPrice()).toBe(100);
        });

        test('should apply silver level (5% discount)', () => {
            const base = new PriceComponent(100);
            const discounted = new LoyaltyDiscount(base, 'silver');

            expect(discounted.getPrice()).toBe(95);
        });

        test('should apply gold level (10% discount)', () => {
            const base = new PriceComponent(100);
            const discounted = new LoyaltyDiscount(base, 'gold');

            expect(discounted.getPrice()).toBe(90);
        });

        test('should apply platinum level (15% discount)', () => {
            const base = new PriceComponent(100);
            const discounted = new LoyaltyDiscount(base, 'platinum');

            expect(discounted.getPrice()).toBe(85);
        });

        test('should calculate savings for each tier', () => {
            const base = new PriceComponent(100);

            const silver = new LoyaltyDiscount(base, 'silver');
            expect(silver.getSavings()).toBe(5);

            const gold = new LoyaltyDiscount(base, 'gold');
            expect(gold.getSavings()).toBe(10);

            const platinum = new LoyaltyDiscount(base, 'platinum');
            expect(platinum.getSavings()).toBe(15);
        });

        test('should show tier name in description', () => {
            const base = new PriceComponent(100);
            const discounted = new LoyaltyDiscount(base, 'gold');
            const desc = discounted.getDescription();

            expect(desc).toContain('GOLD');
        });
    });

    // =============================================
    // Test BundleDiscount
    // =============================================

    describe('BundleDiscount', () => {
        const bundleRule = {
            minQuantity: 3,
            percentage: 15,
            seasonName: 'Spring Sale',
        };

        test('should not apply discount if quantity below minimum', () => {
            const base = new PriceComponent(50);
            const discounted = new BundleDiscount(base, bundleRule);

            expect(discounted.getPrice(2)).toBe(50);
        });

        test('should apply discount if quantity meets minimum', () => {
            const base = new PriceComponent(50);
            const discounted = new BundleDiscount(base, bundleRule);

            expect(discounted.getPrice(3)).toBe(42.5);
        });

        test('should apply discount for quantities above minimum', () => {
            const base = new PriceComponent(50);
            const discounted = new BundleDiscount(base, bundleRule);

            expect(discounted.getPrice(5)).toBe(42.5);
        });

        test('should show season name in description when qualified', () => {
            const base = new PriceComponent(50);
            const discounted = new BundleDiscount(base, bundleRule);
            const desc = discounted.getDescription(3);

            expect(desc).toContain('Spring Sale');
        });

        test('should not show discount in description when not qualified', () => {
            const base = new PriceComponent(50);
            const discounted = new BundleDiscount(base, bundleRule);
            const desc = discounted.getDescription(2);

            expect(desc).not.toContain('Spring Sale');
        });
    });

    // =============================================
    // Test DiscountManager (Orchestration)
    // =============================================

    describe('DiscountManager', () => {
        test('should initialize with base price', () => {
            const manager = new DiscountManager(100);
            expect(manager.getFinalPrice()).toBe(100);
        });

        test('should track applied discounts', () => {
            const manager = new DiscountManager(100);
            manager.applyPercentageDiscount(20, 'SAVE20');

            const breakdown = manager.getPriceBreakdown();
            expect(breakdown.appliedDiscounts).toHaveLength(1);
            expect(breakdown.appliedDiscounts[0].code).toBe('SAVE20');
        });

        test('should support chaining', () => {
            const manager = new DiscountManager(100);

            const result = manager
                .applyPercentageDiscount(10)
                .applyFixedDiscount(5)
                .applyLoyaltyDiscount('gold');

            expect(result).toBe(manager); // Same instance
        });

        test('should combine multiple discounts correctly', () => {
            const manager = new DiscountManager(100);
            manager
                .applyPercentageDiscount(10)      // 100 → 90
                .applyFixedDiscount(10);          // 90 → 80

            expect(manager.getFinalPrice()).toBe(80);
        });

        test('should calculate price with multiple decorators', () => {
            const manager = new DiscountManager(100);
            manager
                .applyLoyaltyDiscount('gold')     // 10% = 90
                .applyPercentageDiscount(15);     // 15% of 90 = 76.5

            expect(manager.getFinalPrice()).toBeCloseTo(76.5, 2);
        });

        test('should return complete breakdown', () => {
            const manager = new DiscountManager(100);
            manager.applyPercentageDiscount(20, 'SAVE20');

            const breakdown = manager.getPriceBreakdown();
            expect(breakdown).toHaveProperty('finalPrice');
            expect(breakdown).toHaveProperty('description');
            expect(breakdown).toHaveProperty('appliedDiscounts');
        });

        test('should reset manager', () => {
            const manager = new DiscountManager(100);
            manager.applyPercentageDiscount(20);
            manager.reset();

            expect(manager.appliedDiscounts).toHaveLength(0);
        });

        test('should remove last discount', () => {
            const manager = new DiscountManager(100);
            manager
                .applyPercentageDiscount(20)
                .applyFixedDiscount(5);

            expect(manager.appliedDiscounts).toHaveLength(2);
            manager.removeLastDiscount();
            expect(manager.appliedDiscounts).toHaveLength(1);
        });

        test('should handle bundle discount with quantity parameter', () => {
            const manager = new DiscountManager(50);
            manager.applyBundleDiscount({
                minQuantity: 3,
                percentage: 15,
            });

            expect(manager.getFinalPrice(2)).toBe(50);
            expect(manager.getFinalPrice(3)).toBe(42.5);
        });
    });

    // =============================================
    // Real-world Scenario Tests
    // =============================================

    describe('Real-world Discount Scenarios', () => {
        test('E-commerce: Product with loyalty + promotional code', () => {
            const manager = new DiscountManager(45.99);
            manager
                .applyLoyaltyDiscount('gold')       // 10% off
                .applyPercentageDiscount(20, 'SUMMER2024'); // Additional 20% off

            const finalPrice = manager.getFinalPrice();
            expect(finalPrice).toBeGreaterThan(0);
            expect(finalPrice).toBeLessThan(45.99);
        });

        test('First-time customer discount', () => {
            const manager = new DiscountManager(99.99);
            manager.applyFixedDiscount(15, 'FIRSTBUY15');

            expect(manager.getFinalPrice()).toBe(84.99);
        });

        test('Black Friday: Buy 3+ get 30% off', () => {
            const manager = new DiscountManager(80);
            manager.applyBundleDiscount({
                minQuantity: 3,
                percentage: 30,
                seasonName: 'Black Friday',
            });

            expect(manager.getFinalPrice(2)).toBe(80); // No discount
            expect(manager.getFinalPrice(3)).toBe(56); // 30% off
            expect(manager.getFinalPrice(5)).toBe(56); // 30% off still
        });

        test('VIP customer: Platinum loyalty + 25% promo', () => {
            const manager = new DiscountManager(200);
            manager
                .applyLoyaltyDiscount('platinum')      // 15% off = 170
                .applyPercentageDiscount(25, 'VIP25'); // Another 25% off

            const finalPrice = manager.getFinalPrice();
            expect(finalPrice).toBeLessThan(130); // Should be around 127.5
        });
    });

    // =============================================
    // Edge Cases
    // =============================================

    describe('Edge Cases', () => {
        test('should handle zero price', () => {
            const manager = new DiscountManager(0);
            manager.applyPercentageDiscount(20);

            expect(manager.getFinalPrice()).toBe(0);
        });

        test('should handle very small prices', () => {
            const manager = new DiscountManager(0.01);
            manager.applyPercentageDiscount(50);

            expect(manager.getFinalPrice()).toBeCloseTo(0.005, 3);
        });

        test('should handle very large prices', () => {
            const manager = new DiscountManager(999999.99);
            manager.applyPercentageDiscount(10);

            expect(manager.getFinalPrice()).toBeCloseTo(899999.991, 2);
        });

        test('should handle negative discount (error case)', () => {
            const base = new PriceComponent(100);
            const discounted = new PercentageDiscount(base, -10);

            // Should increase price (negative discount = markup)
            expect(discounted.getPrice()).toBe(110);
        });

        test('should handle discounts in decimal format', () => {
            const manager = new DiscountManager(100);
            manager.applyPercentageDiscount(2.5);

            expect(manager.getFinalPrice()).toBe(97.5);
        });
    });
});
