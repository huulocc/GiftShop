/**
 * DECORATOR PATTERN - Discount System
 * Allows dynamic addition of discount features to products/cart items
 * without modifying the original product object
 */

/**
 * Base Price Component (without discounts)
 */
class PriceComponent {
    constructor(price) {
        this.price = parseFloat(price);
    }

    getPrice() {
        return this.price;
    }

    getDescription() {
        return `Price: $${this.price.toFixed(2)}`;
    }
}

/**
 * Decorator: Base class for all decorators
 */
class PriceDecorator extends PriceComponent {
    constructor(component) {
        super(0);
        this.component = component;
    }

    getPrice() {
        return this.component.getPrice();
    }

    getDescription() {
        return this.component.getDescription();
    }
}

/**
 * Concrete Decorator: Percentage Discount
 */
class PercentageDiscount extends PriceDecorator {
    constructor(component, percentage, code = '') {
        super(component);
        this.percentage = percentage;
        this.code = code;
    }

    getPrice() {
        const basePrice = this.component.getPrice();
        const discountAmount = (basePrice * this.percentage) / 100;
        return basePrice - discountAmount;
    }

    getDescription() {
        const basePrice = this.component.getPrice();
        const discountAmount = (basePrice * this.percentage) / 100;
        return `${this.component.getDescription()} → ${this.code ? `Code "${this.code}" (${this.percentage}% OFF)` : `${this.percentage}% OFF`}: -$${discountAmount.toFixed(2)}`;
    }

    getSavings() {
        const basePrice = this.component.getPrice();
        return (basePrice * this.percentage) / 100;
    }
}

/**
 * Concrete Decorator: Fixed Amount Discount
 */
class FixedDiscount extends PriceDecorator {
    constructor(component, amount, code = '') {
        super(component);
        this.amount = parseFloat(amount);
        this.code = code;
    }

    getPrice() {
        const basePrice = this.component.getPrice();
        const finalPrice = basePrice - this.amount;
        return finalPrice >= 0 ? finalPrice : 0;
    }

    getDescription() {
        return `${this.component.getDescription()} → ${this.code ? `Code "${this.code}"` : 'Fixed Discount'}: -$${this.amount.toFixed(2)}`;
    }

    getSavings() {
        return this.amount;
    }
}

/**
 * Concrete Decorator: Bundle/Seasonal Discount
 */
class BundleDiscount extends PriceDecorator {
    constructor(component, discountRule = {}) {
        super(component);
        this.minQuantity = discountRule.minQuantity || 1;
        this.discountPercentage = discountRule.percentage || 0;
        this.seasonName = discountRule.seasonName || 'Bundle';
    }

    getPrice(quantity = 1) {
        const basePrice = this.component.getPrice();
        if (quantity >= this.minQuantity) {
            const discountAmount = (basePrice * this.discountPercentage) / 100;
            return basePrice - discountAmount;
        }
        return basePrice;
    }

    getDescription(quantity = 1) {
        if (quantity >= this.minQuantity) {
            const basePrice = this.component.getPrice();
            const discountAmount = (basePrice * this.discountPercentage) / 100;
            return `${this.component.getDescription()} → ${this.seasonName} (Buy ${this.minQuantity}+ items): -$${discountAmount.toFixed(2)}`;
        }
        return this.component.getDescription();
    }
}

/**
 * Concrete Decorator: Loyalty Discount
 */
class LoyaltyDiscount extends PriceDecorator {
    constructor(component, loyaltyTier = 'silver') {
        super(component);
        this.loyaltyTier = loyaltyTier;
        this.discountMap = {
            bronze: 0,
            silver: 5,
            gold: 10,
            platinum: 15,
        };
    }

    getPrice() {
        const basePrice = this.component.getPrice();
        const percentageDiscount = this.discountMap[this.loyaltyTier] || 0;
        const discountAmount = (basePrice * percentageDiscount) / 100;
        return basePrice - discountAmount;
    }

    getDescription() {
        const percentageDiscount = this.discountMap[this.loyaltyTier] || 0;
        if (percentageDiscount === 0) {
            return this.component.getDescription();
        }
        const basePrice = this.component.getPrice();
        const discountAmount = (basePrice * percentageDiscount) / 100;
        return `${this.component.getDescription()} → ${this.loyaltyTier.toUpperCase()} Member (${percentageDiscount}% OFF): -$${discountAmount.toFixed(2)}`;
    }

    getSavings() {
        const basePrice = this.component.getPrice();
        const percentageDiscount = this.discountMap[this.loyaltyTier] || 0;
        return (basePrice * percentageDiscount) / 100;
    }
}

/**
 * Discount Manager - Orchestrates multiple decorators
 */
class DiscountManager {
    constructor(basePrice) {
        this.component = new PriceComponent(basePrice);
        this.appliedDiscounts = [];
    }

    applyPercentageDiscount(percentage, code = '') {
        this.component = new PercentageDiscount(this.component, percentage, code);
        this.appliedDiscounts.push({
            type: 'Percentage',
            value: percentage,
            code,
        });
        return this;
    }

    applyFixedDiscount(amount, code = '') {
        this.component = new FixedDiscount(this.component, amount, code);
        this.appliedDiscounts.push({
            type: 'Fixed',
            value: amount,
            code,
        });
        return this;
    }

    applyLoyaltyDiscount(tier) {
        this.component = new LoyaltyDiscount(this.component, tier);
        this.appliedDiscounts.push({
            type: 'Loyalty',
            value: tier,
        });
        return this;
    }

    applyBundleDiscount(rule) {
        this.component = new BundleDiscount(this.component, rule);
        this.appliedDiscounts.push({
            type: 'Bundle',
            value: rule,
        });
        return this;
    }

    removeLastDiscount() {
        if (this.appliedDiscounts.length > 0) {
            this.appliedDiscounts.pop();
            // Rebuild component chain
            this.rebuildComponents();
        }
        return this;
    }

    rebuildComponents() {
        const basePrice = new PriceComponent(
            parseFloat(this.appliedDiscounts[0]?.basePrice || 0)
        );
        // This is a simplified version - in production, store original price
        this.component = basePrice;
    }

    getFinalPrice(quantity = 1) {
        if (this.component instanceof BundleDiscount) {
            return this.component.getPrice(quantity);
        }
        return this.component.getPrice();
    }

    getPriceBreakdown() {
        return {
            finalPrice: this.getFinalPrice(),
            description: this.component.getDescription(),
            appliedDiscounts: this.appliedDiscounts,
        };
    }

    reset() {
        this.appliedDiscounts = [];
        this.component = new PriceComponent(0);
        return this;
    }
}

export {
    PriceComponent,
    PriceDecorator,
    PercentageDiscount,
    FixedDiscount,
    BundleDiscount,
    LoyaltyDiscount,
    DiscountManager,
};
