/**
 * INTEGRATION GUIDE: How to use the new patterns in the GiftShop project
 *
 * This file shows practical examples of integrating:
 * 1. Observer Pattern (Notifications)
 * 2. Decorator Pattern (Discounts)
 */

import React from 'react';

// ============================================
// STEP 1: Update App.js
// ============================================

/**
 * Current App.js structure needs to be wrapped with NotificationProvider
 *
 * Replace your current App.js with:
 */

const UpdatedApp = () => {
    return `
    import { NotificationProvider } from './contexts/NotificationContext';
    import Header from './components/header/Header';
    import FooterMain from './components/footer/FooterMain';
    import Home from './components/home/Home';
    import ContactUs from './components/contact/ContactUs';
    import { BrowserRouter, Routes, Route } from 'react-router-dom';

    function App() {
      return (
        <NotificationProvider>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/contact" element={<ContactUs />} />
              
              {/* TODO: Add these routes later */}
              {/* <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} /> */}
            </Routes>
            <FooterMain />
          </BrowserRouter>
        </NotificationProvider>
      );
    }

    export default App;
  `;
};

// ============================================
// STEP 2: Add Toast Display Component
// ============================================

/**
 * Create client/src/components/common/ToastContainer.js
 */

const ToastContainer = () => {
    return `
    import React from 'react';
    import { useNotification } from '../../contexts/NotificationContext';
    import './ToastContainer.scss';

    function ToastContainer() {
      const { toasts, removeToast } = useNotification();

      return (
        <div className="toast-container">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={\`toast toast-\${toast.type}\`}
              role="alert"
            >
              <div className="toast-content">
                <span>{toast.message}</span>
                <button
                  className="toast-close"
                  onClick={() => removeToast(toast.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    export default ToastContainer;
  `;
};

/**
 * Create client/src/components/common/ToastContainer.scss
 */

const ToastStyles = () => {
    return `
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;

      .toast {
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
        pointer-events: auto;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 10px;

        .toast-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          font-size: 14px;
        }

        .toast-close {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 0;
          color: currentColor;
          opacity: 0.7;
          transition: opacity 0.2s;

          &:hover {
            opacity: 1;
          }
        }

        &.toast-success {
          background-color: #4caf50;
          color: white;
        }

        &.toast-error {
          background-color: #f44336;
          color: white;
        }

        &.toast-warning {
          background-color: #ff9800;
          color: white;
        }

        &.toast-info {
          background-color: #2196f3;
          color: white;
        }
      }

      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    }

    @media (max-width: 600px) {
      .toast-container {
        left: 10px;
        right: 10px;
        top: 10px;

        .toast {
          max-width: 100%;
        }
      }
    }
  `;
};

// ============================================
// STEP 3: Update Carousel Component
// ============================================

const UpdatedCarousel = () => {
    return `
    import { useState, useEffect } from 'react';
    import { useEventBus } from '../../contexts/NotificationContext';
    import slideData from './slideData.json';
    import next from '../../assets/images/next.png';
    import prev from '../../assets/images/prev.png';

    function SlideShowHome() {
      const { notifyCarouselChanged } = useEventBus();
      const [slides] = useState(slideData);
      const [slideCurrent, setSlideCurrent] = useState(0);
      const slidesLength = slides.length;

      // Auto-advance carousel
      useEffect(() => {
        const interval = setInterval(() => {
          handleNext();
        }, 5000);
        return () => clearInterval(interval);
      }, [slideCurrent]);

      const handleNext = () => {
        const newIndex = slideCurrent === slidesLength - 1 ? 0 : slideCurrent + 1;
        setSlideCurrent(newIndex);

        // ✨ NEW: Notify observers of carousel change
        notifyCarouselChanged({
          currentSlide: newIndex,
          totalSlides: slidesLength,
          slideTitle: slides[newIndex].title,
          slideImage: slides[newIndex].image,
        });

        console.log(\`Carousel advanced to slide \${newIndex + 1}\`);
      };

      const handlePrev = () => {
        const newIndex = slideCurrent === 0 ? slidesLength - 1 : slideCurrent - 1;
        setSlideCurrent(newIndex);

        // ✨ NEW: Notify observers
        notifyCarouselChanged({
          currentSlide: newIndex,
          totalSlides: slidesLength,
          slideTitle: slides[newIndex].title,
          slideImage: slides[newIndex].image,
        });

        console.log(\`Carousel returned to slide \${newIndex + 1}\`);
      };

      return (
        <div className="slideshow-container">
          <div className="slideshow-wrapper">
            {/* Slide image */}
            <img
              src={slides[slideCurrent].image}
              alt={slides[slideCurrent].title}
              className="slideshow-image"
            />

            {/* Navigation buttons */}
            <button className="slideshow-button slideshow-prev" onClick={handlePrev}>
              <img src={prev} alt="Previous" />
            </button>
            <button className="slideshow-button slideshow-next" onClick={handleNext}>
              <img src={next} alt="Next" />
            </button>

            {/* Slide indicators */}
            <div className="slideshow-indicators">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={slides[index] === slides[slideCurrent] ? 'active' : ''}
                  onClick={() => setSlideCurrent(index)}
                />
              ))}
            </div>
          </div>

          {/* Slide content */}
          <div className="slideshow-content">
            <h1>{slides[slideCurrent].title}</h1>
            <p>{slides[slideCurrent].content}</p>
          </div>
        </div>
      );
    }

    export default SlideShowHome;
  `;
};

// ============================================
// STEP 4: Update Product Card Component
// ============================================

const UpdatedProductCard = () => {
    return `
    import { useEventBus } from '../../contexts/NotificationContext';
    import { DiscountManager } from '../../patterns/Decorator';

    function ProductDetailsItems(props) {
      const { notifyProductAddedToCart, notifyDiscountApplied } = useEventBus();
      const item = props;

      const handleAddToCart = () => {
        // Add to cart logic (you'll add this later)
        // cart.add(item);

        // ✨ NEW: Notify observers
        notifyProductAddedToCart({
          productId: item.id,
          productName: item.name,
          price: item.price,
          category: item.categories?.name,
          brand: item.brand?.name,
          image: item.images?.[0]?.path,
        });
      };

      const applyDiscount = (discountCode) => {
        const manager = new DiscountManager(item.price);
        
        // This would validate the code in a real app
        if (discountCode === 'SAVE20') {
          manager.applyPercentageDiscount(20, discountCode);
          
          const breakdown = manager.getPriceBreakdown();
          notifyDiscountApplied({
            code: discountCode,
            originalPrice: item.price,
            newPrice: breakdown.finalPrice,
            savings: item.price - breakdown.finalPrice,
          });
        }
      };

      return (
        <div className="product-card">
          <img src={item.images?.[0]?.path} alt={item.name} />
          <span className="product-status">{item.status}</span>
          <h3>{item.name}</h3>
          <p className="product-brand">{item.brand?.name}</p>
          <p className="product-category">{item.categories?.name}</p>
          <p className="product-price">\${item.price}</p>

          <button onClick={handleAddToCart}>Add To Cart</button>
          <button>Details</button>
          <button>Compare</button>
        </div>
      );
    }

    export default ProductDetailsItems;
  `;
};

// ============================================
// STEP 5: Create Cart Context (Future)
// ============================================

const CartContextTemplate = () => {
    return `
    // client/src/contexts/CartContext.js
    import { createContext, useContext, useState } from 'react';
    import { useEventBus } from './NotificationContext';

    const CartContext = createContext();

    export function CartProvider({ children }) {
      const [cartItems, setCartItems] = useState([]);
      const { notifyCartUpdated } = useEventBus();

      const addToCart = (product, quantity = 1) => {
        setCartItems(prev => {
          const existing = prev.find(item => item.id === product.id);
          const updated = existing
            ? prev.map(item =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            : [...prev, { ...product, quantity }];

          // Notify cart updated
          notifyCartUpdated({
            itemCount: updated.length,
            items: updated,
            total: calculateTotal(updated),
          });

          return updated;
        });
      };

      const removeFromCart = (productId) => {
        setCartItems(prev => {
          const updated = prev.filter(item => item.id !== productId);
          notifyCartUpdated({
            itemCount: updated.length,
            items: updated,
            total: calculateTotal(updated),
          });
          return updated;
        });
      };

      const calculateTotal = (items) => {
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      };

      return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
          {children}
        </CartContext.Provider>
      );
    }

    export function useCart() {
      const context = useContext(CartContext);
      if (!context) {
        throw new Error('useCart must be used within CartProvider');
      }
      return context;
    }
  `;
};

// ============================================
// STEP 6: Example Integration Flow
// ============================================

const IntegrationFlow = () => {
    return `
    // Complete Flow Example:

    1. User clicks "Add to Cart" on a product
       ↓
    2. ProductDetailsItems.handleAddToCart() called
       ↓
    3. notifyProductAddedToCart() emits event
       ↓
    4. NotificationContext receives event
       ↓
    5. ToastNotificationObserver displays toast: "✓ Product added to cart!"
       ↓
    6. AnalyticsObserver logs the action
       ↓
    7. StorageObserver saves to localStorage
       ↓
    8. All observers finished, UI updated with toast

    ===== With Discounts =====

    1. User enters discount code
       ↓
    2. DiscountManager validates and applies discount
       ↓
    3. notifyDiscountApplied() emits event with new price
       ↓
    4. Toast shows: "✓ Discount 'SAVE20' applied! Save $20.00"
       ↓
    5. Price recalculated and displayed to user
  `;
};

// ============================================
// Implementation Checklist
// ============================================

export const ImplementationChecklist = () => {
    return (
        <div style={{ fontFamily: 'monospace', lineHeight: '1.8' }}>
            <h2>🚀 Implementation Checklist</h2>

            <h3>Step 1: Setup Notifications (Required)</h3>
            <ul>
                <li>✓ Copy Decorator.js to client/src/patterns/</li>
                <li>✓ Copy Observer.js to client/src/patterns/</li>
                <li>✓ Copy NotificationContext.js to client/src/contexts/</li>
                <li>[ ] Create ToastContainer.js component</li>
                <li>[ ] Update App.js to use NotificationProvider</li>
                <li>[ ] Update index.css with toast styles</li>
            </ul>

            <h3>Step 2: Update Components (Optional but Recommended)</h3>
            <ul>
                <li>[ ] Update SlideShowHome.js with notifyCarouselChanged()</li>
                <li>[ ] Update ProductDetailsItems.js with notifyProductAddedToCart()</li>
                <li>[ ] Add discount code input field</li>
                <li>[ ] Integrate DiscountManager in pricing logic</li>
            </ul>

            <h3>Step 3: Test Patterns</h3>
            <ul>
                <li>[ ] Import and run exampleBasicDiscount() in browser console</li>
                <li>[ ] Check NotificationContext working with toasts</li>
                <li>[ ] Test carousel events being logged</li>
                <li>[ ] Verify discount calculations</li>
            </ul>

            <h3>Step 4: Future Enhancements</h3>
            <ul>
                <li>[ ] Create CartContext.js for global cart state</li>
                <li>[ ] Implement Factory pattern for products</li>
                <li>[ ] Add Repository pattern for API calls</li>
                <li>[ ] Create Strategy pattern for payments</li>
                <li>[ ] Add unit tests for patterns</li>
            </ul>
        </div>
    );
};

export default {
    UpdatedApp,
    UpdatedCarousel,
    UpdatedProductCard,
    ToastContainer,
    ToastStyles,
    CartContextTemplate,
    IntegrationFlow,
    ImplementationChecklist,
};
