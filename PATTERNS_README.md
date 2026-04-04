# Design Patterns Implementation Guide

Tôi đã triển khai 2 design patterns chính cho GiftShop. Dưới đây là hướng dẫn sử dụng chi tiết:

## 📦 Các file được tạo

### Pattern Files:
- `client/src/patterns/Decorator.js` - Decorator Pattern cho Discounts
- `client/src/patterns/Observer.js` - Observer Pattern cho Notifications
- `client/src/patterns/DecoratorExamples.js` - Ví dụ sử dụng Decorator
- `client/src/patterns/ObserverExamples.js` - Ví dụ sử dụng Observer
- `client/src/contexts/NotificationContext.js` - React Context integration

### Documentation:
- `ARCHITECTURE_REVIEW.md` - Đánh giá chi tiết về project và weak points
- `INTEGRATION_GUIDE.js` - Hướng dẫn tích hợp vào project hiện tại

---

## 1️⃣ DECORATOR PATTERN - Discount System (Giảm Giá)

### Ý tưởng:
Thêm các discount features động vào giá sản phẩm mà không sửa đổi object gốc.

### Các Discount Decorators:

#### A) Percentage Discount (Giảm %)
```javascript
import { DiscountManager } from './patterns/Decorator';

const manager = new DiscountManager(100); // Giá gốc: $100
manager.applyPercentageDiscount(20, 'SAVE20'); // Giảm 20%

manager.getFinalPrice(); // 80
manager.getPriceBreakdown();
// {
//   finalPrice: 80,
//   description: "Price: $100.00 → Code "SAVE20" (20% OFF): -$20.00",
//   appliedDiscounts: [...]
// }
```

#### B) Fixed Amount Discount (Giảm $ cố định)
```javascript
const manager = new DiscountManager(50);
manager.applyFixedDiscount(15, 'FIRST15'); // Giảm $15

manager.getFinalPrice(); // 35
```

#### C) Loyalty Discount (Giảm theo level thành viên)
```javascript
const manager = new DiscountManager(100);

// Levels: bronze (0%), silver (5%), gold (10%), platinum (15%)
manager.applyLoyaltyDiscount('gold'); // Gold member: 10% off

manager.getFinalPrice(); // 90
```

#### D) Bundle Discount (Giảm khi mua nhiều)
```javascript
const manager = new DiscountManager(50);

manager.applyBundleDiscount({
  minQuantity: 3,      // Mua từ 3 sản phẩm
  percentage: 15,      // Giảm 15%
  seasonName: 'Spring Sale'
});

manager.getFinalPrice(2); // 50 (không đủ số lượng)
manager.getFinalPrice(3); // 42.5 (đủ 3 sản phẩm, giảm 15%)
```

### Kết hợp nhiều Discount:
```javascript
const manager = new DiscountManager(100);

manager
  .applyLoyaltyDiscount('gold')        // 10% off
  .applyPercentageDiscount(15, 'CODE'); // Thêm 15% off

manager.getFinalPrice(); // 72.5 (cộng gộp các discount)
```

### Sử dụng trong từng sản phẩm:
```javascript
function ProductDetailsItems({ product, userTier, appliedCoupon }) {
  const manager = new DiscountManager(product.price);
  
  if (userTier) {
    manager.applyLoyaltyDiscount(userTier);
  }
  
  if (appliedCoupon) {
    manager.applyPercentageDiscount(appliedCoupon.percentage, appliedCoupon.code);
  }
  
  const { finalPrice, description } = manager.getPriceBreakdown();
  
  return (
    <div>
      <h3>{product.name}</h3>
      <p>Original Price: ${product.price}</p>
      <p>Final Price: ${finalPrice}</p>
      <p className="discount-info">{description}</p>
    </div>
  );
}
```

---

## 2️⃣ OBSERVER PATTERN - Notification System

### Ý tưởng:
Khi một sự kiện xảy ra (thêm vào giỏ, áp dụng discount, tạo đơn hàng), tất cả các "observers" (người quan sát) sẽ được thông báo tự động.

### Các Events có sẵn:
```javascript
EventType.CAROUSEL_CHANGED           // Carousel thay đổi slide
EventType.PRODUCT_VIEWED             // Xem sản phẩm
EventType.PRODUCT_ADDED_TO_CART      // Thêm vào giỏ
EventType.CART_UPDATED               // Cập nhật giỏ hàng
EventType.DISCOUNT_APPLIED           // Áp dụng discount
EventType.DISCOUNT_CODE_INVALID      // Mã discount không hợp lệ
EventType.USER_LOGGED_IN            // Đăng nhập
EventType.ORDER_CREATED             // Tạo đơn hàng
EventType.ORDER_COMPLETED           // Đơn hàng hoàn thành
```

### Các Observer Types:

#### A) Toast Notification (Thông báo popup)
Tự động hiển thị toast khi sự kiện xảy ra:
```
✓ Mug added to cart!
✓ Discount 'SAVE20' applied! Save $20.00
✗ Invalid discount code: BADCODE
```

#### B) Analytics Observer
Ghi lại tất cả các sự kiện để phân tích:
```
📊 Analytics logged: 
   event: product:added-to-cart
   timestamp: 2024-04-04T10:30:00Z
   data: { productId: 1, productName: 'Mug' }
```

#### C) Storage Observer
Lưu các sự kiện vào localStorage:
```javascript
// Tự động lưu vào localStorage các sự kiện như:
// - Product added to cart
// - Discount applied
// - Order created
localStorage.getItem('giftshop_events') 
// [
//   { eventType: 'product:added-to-cart', data: {...} },
//   { eventType: 'discount:applied', data: {...} }
// ]
```

#### D) Email Notification (Tương lai)
Gửi email khi đơn hàng được tạo/hoàn thành

### Setup NotificationProvider:

```javascript
// client/src/index.js
import { NotificationProvider } from './contexts/NotificationContext';

ReactDOM.render(
  <NotificationProvider>
    <App />
  </NotificationProvider>,
  document.getElementById('root')
);
```

### Sử dụng trong Components:

#### Bước 1: Import hook
```javascript
import { useEventBus } from '../contexts/NotificationContext';
```

#### Bước 2: Lấy các notification functions
```javascript
const { notifyProductAddedToCart, notifyDiscountApplied } = useEventBus();
```

#### Bước 3: Gọi khi events xảy ra
```javascript
function ProductCard({ product }) {
  const { notifyProductAddedToCart } = useEventBus();

  const handleAddToCart = () => {
    // Thêm vào giỏ hàng logic here...
    addToCart(product);

    // Thông báo tất cả observers
    notifyProductAddedToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1
    });
    
    // Toast sẽ tự động hiển thị: "✓ Mug added to cart!"
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}
```

### Ví dụ trong Carousel (SlideShowHome.js):

```javascript
import { useEventBus } from '../contexts/NotificationContext';

function SlideShowHome() {
  const { notifyCarouselChanged } = useEventBus();
  const [slides] = useState(slideData);
  const [slideCurrent, setSlideCurrent] = useState(0);

  const handleNext = () => {
    const newIndex = slideCurrent === slides.length - 1 ? 0 : slideCurrent + 1;
    setSlideCurrent(newIndex);

    // ✨ Thay event cũ bằng Observer
    notifyCarouselChanged({
      currentSlide: newIndex,
      totalSlides: slides.length,
      slideTitle: slides[newIndex].title,
    });
  };

  return (
    <div>
      {/* Carousel UI */}
      <button onClick={handleNext}>Next</button>
    </div>
  );
}
```

### Xem Toast Notifications:
```javascript
import { useNotification } from '../contexts/NotificationContext';

function ToastContainer() {
  const { toasts, removeToast } = useNotification();

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.message}
          <button onClick={() => removeToast(toast.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 Sơ đồ hoạt động

### Decorator Pattern Flow:
```
User applies coupon "SAVE20"
        ↓
DiscountManager(basePrice)
        ↓
applyPercentageDiscount(20, "SAVE20")
        ↓
getFinalPrice()
        ↓
Display discounted price + savings breakdown
```

### Observer Pattern Flow:
```
User clicks "Add to Cart"
        ↓
handleAddToCart() called
        ↓
notifyProductAddedToCart(productData)
        ↓
notificationBus notifies all observers:
    ├── ToastObserver → Show toast ✓
    ├── AnalyticsObserver → Log event 📊
    └── StorageObserver → Save to localStorage 💾
        ↓
All observers notified simultaneously
```

---

## 📝 Weak Points của Project (từ ARCHITECTURE_REVIEW.md)

### 1. **State Management** ⚠️ CRITICAL
- Không có global state (Redux, Context)
- Props drilling sẽ gây vấn đề khi project lớn
- Giỏ hàng không persist khi reload trang

**Fix:** Tạo CartContext + UserContext

### 2. **Backend API Missing** ⚠️ CRITICAL
- Server chỉ có test endpoint
- Không có API endpoints cho products, cart, orders
- Dữ liệu đang static JSON trong frontend

**Fix:**
- Tạo Express endpoints: `/api/products`, `/api/cart`, `/api/orders`
- Kết nối MongoDB/PostgreSQL
- Implement JWT authentication

### 3. **Incomplete Routes** ⚠️ HIGH
- `/products/:categoryId` - Chưa implement
- `/brands/:brandId` - Chưa implement
- `/cart` - Chưa có
- `/checkout` - Chưa có
- User login/register - Buttons chỉ là UI

### 4. **No Error Handling** ⚠️ MEDIUM
- Không có try-catch
- Không validate input
- Không có error boundaries

### 5. **Testing** ⚠️ MEDIUM
- Chỉ có `App.test.js` nhưng không có tests thực tế
- Components untested

### 6. **Performance** ⚠️ MEDIUM
- Không có code splitting
- Không có lazy loading
- Products JSON load hết lên từ đầu

---

## 💡 Suggested Additional Patterns

### 1. **Factory Pattern** (for products)
```javascript
class ProductFactory {
  static create(type, data) {
    if (type === 'physical') return new PhysicalProduct(data);
    if (type === 'digital') return new DigitalProduct(data);
    if (type === 'gift-card') return new GiftCard(data);
  }
}
```

### 2. **Strategy Pattern** (for payments)
```javascript
class PaymentStrategy {
  pay(amount) { }
}

class CreditCardPayment extends PaymentStrategy { }
class PayPalPayment extends PaymentStrategy { }
class ApplePayPayment extends PaymentStrategy { }
```

### 3. **Repository Pattern** (for data access)
```javascript
class ProductRepository {
  async getAll() { /* fetch products */ }
  async getById(id) { /* fetch product */ }
  async search(query) { /* search */ }
}
```

### 4. **Provider Pattern** (for global state)
```javascript
<CartProvider>
  <UserProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </UserProvider>
</CartProvider>
```

---

## 🚀 Bước tiếp theo

1. **Tích hợp NotificationProvider vào App.js**
2. **Tạo ToastContainer component**
3. **Update SlideShowHome.js sử dụng Observer**
4. **Update ProductDetailsItems.js sử dụng Observer**
5. **Tạo CartContext cho global cart state**
6. **Implement backend APIs**
7. **Thêm form validation, error handling**

---

## 📞 Cần giúp?

- Xem `ARCHITECTURE_REVIEW.md` để hiểu rõ weak points
- Xem `INTEGRATION_GUIDE.js` để biết cách integrate
- Xem `DecoratorExamples.js` và `ObserverExamples.js` để hiểu cách dùng

---

## 📚 Tổng kết

### ✅ Decorator Pattern (Discount)
- Thêm/Remove discounts động
- Combine multiple discounts
- Track savings & breakdown
- **Usecase:** Pricing, promotions, loyalty programs

### ✅ Observer Pattern (Notifications)
- Event-driven architecture
- Loosely coupled components
- Multiple observers per event
- **Usecase:** User notifications, analytics, logging

### 💡 Next Patterns
- Factory: Create different product types
- Strategy: Multiple payment methods
- Repository: Abstract API calls
- Provider: Global state management

---

Good luck! 🎉
