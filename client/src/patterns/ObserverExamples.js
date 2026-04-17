/**
 * EXAMPLE: Using Observer Pattern for Notifications
 * This demonstrates how to trigger events and listen to them
 */

import { notificationBus, EventType } from '../patterns/Observer';

// ============================================
// Example 1: Carousel Event with Observer
// ============================================
export function exampleCarouselWithObserver() {
    console.log('=== Example 1: Carousel Events ===');

    // Simulate carousel slide change
    const handleSlideChange = (slideIndex, totalSlides) => {
        notificationBus.notify(EventType.CAROUSEL_CHANGED, {
            currentSlide: slideIndex,
            totalSlides: totalSlides,
            slideTitle: `Beautiful Gift #${slideIndex + 1}`,
        });
    };

    // Simulate auto-advance
    const slideInterval = setInterval(() => {
        handleSlideChange(Math.floor(Math.random() * 5), 5);
    }, 3000);

    // Cleanup
    return () => clearInterval(slideInterval);
}

// ============================================
// Example 2: Product Added to Cart
// ============================================
export function exampleProductAddedToCart() {
    console.log('=== Example 2: Product Added to Cart ===');

    const handleAddToCart = (product, quantity = 1) => {
        // Validate product
        if (!product || !product.id) {
            console.error('Invalid product');
            return;
        }

        // Notify observers
        notificationBus.notify(EventType.PRODUCT_ADDED_TO_CART, {
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: quantity,
            total: product.price * quantity,
        });
    };

    // Test the function
    const testProduct = {
        id: 1,
        name: 'Enamel Mug',
        price: 20.0,
    };

    handleAddToCart(testProduct, 2);
}

// ============================================
// Example 3: Discount Applied
// ============================================
export function exampleDiscountApplied() {
    console.log('=== Example 3: Discount Applied ===');

    const handleApplyDiscount = (code, percentage, cartTotal) => {
        const savings = (cartTotal * percentage) / 100;
        const newTotal = cartTotal - savings;

        notificationBus.notify(EventType.DISCOUNT_APPLIED, {
            code: code,
            percentage: percentage,
            originalTotal: cartTotal,
            savings: savings,
            newTotal: newTotal,
        });
    };

    handleApplyDiscount('SAVE20', 20, 100);
}

// ============================================
// Example 4: Invalid Discount Code
// ============================================
export function exampleInvalidDiscountCode() {
    console.log('=== Example 4: Invalid Discount Code ===');

    const handleInvalidCode = (code) => {
        notificationBus.notify(EventType.DISCOUNT_CODE_INVALID, {
            code: code,
            reason: 'Coupon code not found or expired',
        });
    };

    handleInvalidCode('INVALID123');
}

// ============================================
// Example 5: Cart Updated
// ============================================
export function exampleCartUpdated() {
    console.log('=== Example 5: Cart Updated ===');

    const handleCartUpdate = (cartItems, cartTotal) => {
        notificationBus.notify(EventType.CART_UPDATED, {
            itemCount: cartItems.length,
            items: cartItems,
            total: cartTotal,
            updatedAt: new Date().toISOString(),
        });
    };

    const cart = [
        { id: 1, name: 'Mug', price: 20, qty: 2 },
        { id: 5, name: 'Bracelet', price: 45, qty: 1 },
    ];
    const total = 20 * 2 + 45 * 1;

    handleCartUpdate(cart, total);
}

// ============================================
// Example 6: Order Created
// ============================================
export function exampleOrderCreated() {
    console.log('=== Example 6: Order Created ===');

    const handleCreateOrder = (orderData) => {
        notificationBus.notify(EventType.ORDER_CREATED, {
            orderId: orderData.id,
            userEmail: orderData.email,
            items: orderData.items,
            total: orderData.total,
            status: 'pending',
            createdAt: new Date().toISOString(),
        });
    };

    const order = {
        id: 'ORD-2024-001',
        email: 'customer@email.com',
        items: [{ name: 'Mug', qty: 2 }],
        total: 40.0,
    };

    handleCreateOrder(order);
}

// ============================================
// Example 7: Get Event History
// ============================================
export function exampleEventHistory() {
    console.log('=== Example 7: Event History ===');

    // Generate some events
    notificationBus.notify(EventType.PRODUCT_ADDED_TO_CART, {
        productName: 'Mug',
    });
    notificationBus.notify(EventType.PRODUCT_ADDED_TO_CART, {
        productName: 'Bracelet',
    });
    notificationBus.notify(EventType.DISCOUNT_APPLIED, { code: 'SAVE20' });

    // Get history
    const allHistory = notificationBus.getEventHistory();
    const cartHistory = notificationBus.getEventHistory(
        EventType.PRODUCT_ADDED_TO_CART
    );

    console.log('All events:', allHistory);
    console.log('Cart events only:', cartHistory);
}

// ============================================
// Example 8: Observer Count
// ============================================
export function exampleObserverCount() {
    console.log('=== Example 8: Observer Count ===');

    const count = notificationBus.getObserversCount(
        EventType.PRODUCT_ADDED_TO_CART
    );
    console.log(`Observers listening to PRODUCT_ADDED_TO_CART: ${count}`);
}

// ============================================
// React Hook Example
// ============================================
export function useCartNotifications() {
    return {
        addToCart: (product, quantity = 1) => {
            notificationBus.notify(EventType.PRODUCT_ADDED_TO_CART, {
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: quantity,
            });
        },

        updateCart: (items, total) => {
            notificationBus.notify(EventType.CART_UPDATED, {
                itemCount: items.length,
                items,
                total,
            });
        },

        applyDiscount: (code, savings, newTotal) => {
            notificationBus.notify(EventType.DISCOUNT_APPLIED, {
                code,
                savings,
                newTotal,
            });
        },

        invalidCode: (code) => {
            notificationBus.notify(EventType.DISCOUNT_CODE_INVALID, {
                code,
            });
        },

        createOrder: (orderId, email, total) => {
            notificationBus.notify(EventType.ORDER_CREATED, {
                orderId,
                userEmail: email,
                total,
            });
        },
    };
}

// ============================================
// Component Example: SlideShowHome with Observer
// ============================================
export function SlideShowHomeWithObserver() {
    /**
     * Replace the current SlideShowHome.js carousel with this:
     *
     * import { useEventBus } from '../contexts/NotificationContext';
     *
     * function SlideShowHome() {
     *   const { notifyCarouselChanged } = useEventBus();
     *   const [slideCurrent, setSlideCurrent] = useState(0);
     *
     *   const handleNext = () => {
     *     const newSlide = slideCurrent === slidesLength - 1 ? 0 : slideCurrent + 1;
     *     setSlideCurrent(newSlide);
     *
     *     // Notify observers of carousel change
     *     notifyCarouselChanged({
     *       currentSlide: newSlide,
     *       totalSlides: slidesLength,
     *       slideTitle: slides[newSlide].title,
     *     });
     *   };
     *
     *   // Rest of component...
     * }
     */

    return `
    // Update SlideShowHome.js with this pattern:
    
    import { useEventBus } from '../contexts/NotificationContext';
    
    function SlideShowHome() {
      const { notifyCarouselChanged } = useEventBus();
      const [slideCurrent, setSlideCurrent] = useState(0);
      const [slides] = useState(slideData);
      const slidesLength = slides.length;
    
      const handleNext = () => {
        const newSlide = slideCurrent === slidesLength - 1 ? 0 : slideCurrent + 1;
        setSlideCurrent(newSlide);
        
        // Observer pattern: Notify all listeners of carousel change
        notifyCarouselChanged({
          currentSlide: newSlide,
          totalSlides: slidesLength,
          slideTitle: slides[newSlide].title,
          slideImage: slides[newSlide].image,
        });
      };
    
      // Rest of component remains the same...
    }
  `;
}

// ============================================
// Component Example: Add to Cart with Observer
// ============================================
export function ProductCardWithObserver() {
    /**
     * Update ProductDetailsItems.js:
     *
     * import { useEventBus } from '../contexts/NotificationContext';
     *
     * function ProductDetailsItems(props) {
     *   const { notifyProductAddedToCart } = useEventBus();
     *   const item = props;
     *
     *   const handleAddToCart = () => {
     *     // Add to cart logic...
     *
     *     // Notify observers
     *     notifyProductAddedToCart({
     *       productId: item.id,
     *       productName: item.name,
     *       price: item.price,
     *       category: item.categories.name,
     *     });
     *   };
     *
     *   return (
     *     <div>
     *       <button onClick={handleAddToCart}>Add To Cart</button>
     *     </div>
     *   );
     * }
     */

    return `
    import { useEventBus } from '../contexts/NotificationContext';
    
    function ProductDetailsItems({ id, name, price, categories }) {
      const { notifyProductAddedToCart } = useEventBus();
    
      const handleAddToCart = () => {
        // Cart logic here...
        
        // Notify all observers
        notifyProductAddedToCart({
          productId: id,
          productName: name,
          price: price,
          category: categories?.name,
        });
      };
    
      return (
        <button onClick={handleAddToCart}>
          Add To Cart
        </button>
      );
    }
  `;
}

// Run all examples
export function runAllObserverExamples() {
    console.log('Starting Observer Pattern Examples...\n');

    exampleCarouselWithObserver();
    console.log('\n');

    exampleProductAddedToCart();
    console.log('\n');

    exampleDiscountApplied();
    console.log('\n');

    exampleInvalidDiscountCode();
    console.log('\n');

    exampleCartUpdated();
    console.log('\n');

    exampleOrderCreated();
    console.log('\n');

    exampleEventHistory();
    console.log('\n');

    exampleObserverCount();
}
