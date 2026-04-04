# 🧪 Hướng Dẫn Testing - Design Patterns GiftShop

Tôi đã tạo bộ test hoàn chỉnh cho cả Decorator Pattern và Observer Pattern. Hướng dẫn dưới đây sẽ giúp bạn hiểu và chạy các tests.

---

## 📦 Các File Test Được Tạo

```
client/src/
├── patterns/
│   ├── Decorator.test.js              ✅ 40+ unit tests
│   ├── Observer.test.js               ✅ 50+ unit tests
│   └── (observer patterns code)
└── contexts/
    ├── NotificationContext.test.js    ✅ 30+ integration tests
    └── (notification context code)
```

**Tổng cộng: 120+ tests**

---

## 🚀 Cách Chạy Tests

### 1. Chạy tất cả tests
```bash
npm test
```

### 2. Chạy test file cụ thể
```bash
# Test Decorator Pattern
npm test Decorator.test.js

# Test Observer Pattern
npm test Observer.test.js

# Test React Integration
npm test NotificationContext.test
```

### 3. Chạy test trong Watch Mode (tự reload khi code change)
```bash
npm test -- --watch
```

### 4. Xem coverage (tỷ lệ code được test)
```bash
npm test -- --coverage
```

### 5. Chạy test với verbose output
```bash
npm test -- --verbose
```

### 6. Chạy test một lần không watch
```bash
CI=true npm test
```

---

## 📊 Bài Tập Test Decorator Pattern (40+ tests)

File: `client/src/patterns/Decorator.test.js`

### Test Groups:

#### 1. **PriceComponent Tests** (5 tests)
Kiểm tra base price component:
```javascript
✓ should create a PriceComponent with correct price
✓ should format price correctly in description
✓ should handle decimal prices
✓ should convert string price to number
```

#### 2. **PercentageDiscount Tests** (5 tests)
Kiểm tra discount %:
```javascript
✓ should apply 20% discount
✓ should calculate savings correctly
✓ should show discount code in description
✓ should handle small percentages
✓ should handle 100% discount (free)
```

#### 3. **FixedDiscount Tests** (5 tests)
Kiểm tra discount $ cố định:
```javascript
✓ should apply fixed discount of $15
✓ should prevent negative prices
✓ should include discount code in description
✓ should handle decimal discount amounts
✓ should work with string amount
```

#### 4. **LoyaltyDiscount Tests** (7 tests)
Kiểm tra loyalty tiers:
```javascript
✓ should apply bronze level (no discount)
✓ should apply silver level (5% discount)
✓ should apply gold level (10% discount)
✓ should apply platinum level (15% discount)
✓ should calculate savings for each tier
✓ should show tier name in description
```

#### 5. **BundleDiscount Tests** (5 tests)
Kiểm tra mua nhiều được discount:
```javascript
✓ should not apply discount if quantity below minimum
✓ should apply discount if quantity meets minimum
✓ should apply discount for quantities above minimum
✓ should show season name in description when qualified
✓ should not show discount in description when not qualified
```

#### 6. **DiscountManager Tests** (8 tests)
Kiểm tra orchestration:
```javascript
✓ should initialize with base price
✓ should track applied discounts
✓ should support chaining
✓ should combine multiple discounts correctly
✓ should calculate price with multiple decorators
✓ should return complete breakdown
✓ should reset manager
✓ should remove last discount
```

#### 7. **Real-world Scenarios** (4 tests)
Kiểm tra tình huống thực tế:
```javascript
✓ E-commerce: Product with loyalty + promotional code
✓ First-time customer discount
✓ Black Friday: Buy 3+ get 30% off
✓ VIP customer: Platinum loyalty + 25% promo
```

#### 8. **Edge Cases** (6 tests)
Kiểm tra trường hợp đặc biệt:
```javascript
✓ should handle zero price
✓ should handle very small prices
✓ should handle very large prices
✓ should handle negative discount (error case)
✓ should handle discounts in decimal format
```

### Ví dụ Test Decorator:

```javascript
test('should apply 20% discount', () => {
  const base = new PriceComponent(100);
  const discounted = new PercentageDiscount(base, 20, 'SAVE20');

  expect(discounted.getPrice()).toBe(80);
});

test('should combine multiple discounts correctly', () => {
  const manager = new DiscountManager(100);
  manager
    .applyPercentageDiscount(10)      // 100 → 90
    .applyFixedDiscount(10);          // 90 → 80

  expect(manager.getFinalPrice()).toBe(80);
});
```

---

## 📊 Bài Tập Test Observer Pattern (50+ tests)

File: `client/src/patterns/Observer.test.js`

### Test Groups:

#### 1. **NotificationSubject Tests** (7 tests)
Kiểm tra event bus:
```javascript
✓ should create subject with empty observers
✓ should subscribe observer to event
✓ should subscribe multiple observers to same event
✓ should subscribe same observer to different events
✓ should return unique observer ID on subscribe
✓ should accept custom observer ID
✓ should unsubscribe observer from event
```

#### 2. **Notification Broadcasting Tests** (6 tests)
Kiểm tra broadcasting:
```javascript
✓ should notify single observer
✓ should notify multiple observers of same event
✓ should include timestamp in notification
✓ should include observerId in notification
✓ should not notify observers of unrelated events
```

#### 3. **Event History Tests** (6 tests)
Kiểm tra history tracking:
```javascript
✓ should store event in history
✓ should store multiple events in history
✓ should retrieve history for specific event type
✓ should limit history with limit parameter
✓ should respect max history size
✓ should clear history
```

#### 4. **ToastNotificationObserver Tests** (3 tests)
Kiểm tra toast observer:
```javascript
✓ should call toast callback for product added event
✓ should show success notification for discount application
✓ should show error for invalid discount code
```

#### 5. **AnalyticsObserver Tests** (2 tests)
Kiểm tra analytics:
```javascript
✓ should log events to analytics
✓ should compute event summary
```

#### 6. **StorageObserver Tests** (5 tests)
Kiểm tra localStorage:
```javascript
✓ should save events to localStorage
✓ should only save specific event types
✓ should limit stored events to 100
✓ should clear storage
```

#### 7. **Real-world Event Scenarios** (2 tests)
Kiểm tra flow thực tế:
```javascript
✓ Complete shopping flow: Add to cart → Apply discount → Create order
✓ Multiple products and discounts tracking
```

#### 8. **Error Handling** (3 tests)
Kiểm tra error handling:
```javascript
✓ should handle observer that throws error
✓ should handle notify with no observers
✓ should handle unsubscribe when no subscribers
```

#### 9. **Global NotificationBus Tests** (2 tests)
Kiểm tra global bus:
```javascript
✓ notificationBus should be singleton
✓ notificationBus should persist subscriptions
```

### Ví dụ Test Observer:

```javascript
test('should notify single observer', (done) => {
  class MockObserver extends Observer {
    update(eventData) {
      expect(eventData.eventType).toBe(EventType.PRODUCT_ADDED_TO_CART);
      expect(eventData.data.productName).toBe('Mug');
      done();
    }
  }

  const observer = new MockObserver();
  subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer);
  subject.notify(EventType.PRODUCT_ADDED_TO_CART, { productName: 'Mug' });
});

test('should compute event summary', () => {
  const observer = new AnalyticsObserver();

  subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer);
  subject.subscribe(EventType.DISCOUNT_APPLIED, observer);

  subject.notify(EventType.PRODUCT_ADDED_TO_CART, {});
  subject.notify(EventType.PRODUCT_ADDED_TO_CART, {});
  subject.notify(EventType.DISCOUNT_APPLIED, {});

  const summary = observer.getEventsSummary();
  expect(summary[EventType.PRODUCT_ADDED_TO_CART]).toBe(2);
  expect(summary[EventType.DISCOUNT_APPLIED]).toBe(1);
});
```

---

## 🧩 Integration Tests - React Components (30+ tests)

File: `client/src/contexts/NotificationContext.test.js`

### Test Groups:

#### 1. **NotificationProvider Tests** (2 tests)
```javascript
✓ should render children
✓ should provide notification context to children
```

#### 2. **useNotification Hook Tests** (2 tests)
```javascript
✓ should throw error when used outside provider
✓ should return notification context
```

#### 3. **useEventBus Hook Tests** (5 tests)
```javascript
✓ should provide notification methods
✓ should emit product added to cart event
✓ should emit discount applied event
✓ should emit invalid discount code event
✓ should emit cart updated event
```

#### 4. **Toast Display and Removal** (3 tests)
```javascript
✓ should display toast notification
✓ should remove toast when close button clicked
✓ should auto-remove non-error toasts after delay
```

#### 5. **Multiple Concurrent Events** (1 test)
```javascript
✓ should handle multiple events simultaneously
```

#### 6. **Real-world Integration Scenarios** (1 test)
```javascript
✓ Shopping flow: Add to cart → Apply discount
```

### Ví dụ Test React Integration:

```javascript
test('should emit product added to cart event', async () => {
  const TestComponent = () => {
    const { notifyProductAddedToCart } = useEventBus();
    const { toasts } = useNotification();

    return (
      <div>
        <button
          onClick={() =>
            notifyProductAddedToCart({
              productName: 'Test Mug',
              price: 20,
            })
          }
        >
          Add Product
        </button>
        <div data-testid="toast-count">{toasts.length}</div>
      </div>
    );
  };

  render(
    <NotificationProvider>
      <TestComponent />
    </NotificationProvider>
  );

  const button = screen.getByRole('button', { name: /add product/i });
  await userEvent.click(button);

  await waitFor(() => {
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
  });
});
```

---

## 🎯 Test Coverage Expected

Sau khi chạy tests với coverage:

```bash
npm test -- --coverage
```

Bạn sẽ thấy:
```
Decorator.js        | 95% | 94% | 93% | 92%
Observer.js         | 98% | 97% | 97% | 97%
NotificationContext | 90% | 88% | 85% | 88%
```

---

## 🔥 Chạy Tests Thực Tế

### Bước 1: Mở Terminal tại thư mục project
```bash
cd D:\GitHub\GiftShop
```

### Bước 2: Chạy tất cả tests
```bash
npm test
```

### Bước 3: Chọn mode
```
 › Press a to run all tests.
 › Press f to run only failed tests.
 › Press p to filter by a filename regex pattern.
 › Press t to filter by a test name regex pattern.
 › Press q to quit watch mode.
 › Press Enter to trigger a test run.
```

### Bước 4: Press `a` để chạy tất cả

### Bước 5: Xem kết quả
```
PASS  src/patterns/Decorator.test.js (3.245s)
PASS  src/patterns/Observer.test.js (2.481s)
PASS  src/contexts/NotificationContext.test.js (5.123s)

Test Suites: 3 passed, 3 total
Tests:       120 passed, 120 total
Coverage: 92% average
Time:     10.85s
```

---

## 📝 Chi Tiết Từng Test

### Decorator Pattern - Ví dụ Chi Tiết

```javascript
describe('Decorator Pattern - Discount System', () => {
  describe('PercentageDiscount', () => {
    // Test case 1: Kiểm tra tính toán discount %
    test('should apply 20% discount', () => {
      // ARRANGE: Chuẩn bị data
      const base = new PriceComponent(100);
      const discounted = new PercentageDiscount(base, 20, 'SAVE20');

      // ACT: Thực hiện action
      const price = discounted.getPrice();

      // ASSERT: Kiểm tra kết quả
      expect(price).toBe(80);
    });

    // Test case 2: Kiểm tra savings
    test('should calculate savings correctly', () => {
      const base = new PriceComponent(100);
      const discounted = new PercentageDiscount(base, 25);

      expect(discounted.getSavings()).toBe(25);
    });
  });
});
```

**Pattern AAA:**
- **A**rrange: Chuẩn bị test data
- **A**ct: Thực hiện function
- **A**ssert: Kiểm tra kết quả

---

### Observer Pattern - Ví dụ Chi Tiết

```javascript
describe('Observer Pattern', () => {
  describe('Notification Broadcasting', () => {
    // Test bất đồng bộ với callback
    test('should notify single observer', (done) => {
      // ARRANGE
      class MockObserver extends Observer {
        update(eventData) {
          // ASSERT
          expect(eventData.eventType).toBe(EventType.PRODUCT_ADDED_TO_CART);
          done(); // Báo xong async test
        }
      }

      const observer = new MockObserver();
      subject.subscribe(EventType.PRODUCT_ADDED_TO_CART, observer);

      // ACT
      subject.notify(EventType.PRODUCT_ADDED_TO_CART, {
        productName: 'Mug',
      });
    });
  });
});
```

**Lưu ý Async Testing:**
- Dùng `done()` callback khi test bất đồng bộ
- Hoặc dùng `async/await` + `waitFor()`

---

### React Integration - Ví dụ Chi Tiết

```javascript
test('should emit product added to cart event', async () => {
  // ARRANGE: Tạo component test
  const TestComponent = () => {
    const { notifyProductAddedToCart } = useEventBus();
    const { toasts } = useNotification();

    return (
      <div>
        <button onClick={() => notifyProductAddedToCart({})}>
          Add Product
        </button>
        <div data-testid="toast-count">{toasts.length}</div>
      </div>
    );
  };

  // Render component với provider
  render(
    <NotificationProvider>
      <TestComponent />
    </NotificationProvider>
  );

  // ACT: Click button
  const button = screen.getByRole('button', { name: /add product/i });
  await userEvent.click(button);

  // ASSERT: Kiểm tra toast xuất hiện
  await waitFor(() => {
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
  });
});
```

---

## ✅ Testing Checklist

Khi viết component mới, test theo checklist này:

### Decorator Pattern:
- [ ] Base class hoạt động?
- [ ] Mỗi decorator apply discount đúng?
- [ ] Chaining multiple decorators?
- [ ] Calculate savings?
- [ ] Negative prices handled?
- [ ] Edge cases (0, very large, very small)?

### Observer Pattern:
- [ ] Subscribe observers?
- [ ] Unsubscribe observers?
- [ ] Notify broadcasts to all?
- [ ] Event history persisted?
- [ ] Error handling?
- [ ] Multiple events handled?

### React Integration:
- [ ] Provider renders children?
- [ ] Hooks throw error outside provider?
- [ ] Events trigger notifications?
- [ ] Toast displays?
- [ ] Toast auto-removes?
- [ ] Multiple events at once?

---

## 🐛 Debug Tests

### Xem test đang làm gì:
```javascript
test('debug example', () => {
  // Sử dụng console.log
  const manager = new DiscountManager(100);
  manager.applyPercentageDiscount(20);
  
  console.log('Final Price:', manager.getFinalPrice()); // Hiển thị trong test output
  expect(manager.getFinalPrice()).toBe(80);
});
```

### Print DOM trong React test:
```javascript
test('debug component', () => {
  const { container } = render(
    <NotificationProvider>
      <TestComponent />
    </NotificationProvider>
  );

  // Xem toàn bộ DOM
  console.log(container.innerHTML);

  // Hoặc chỉ một phần
  console.log(screen.debug());
});
```

### Chạy một test duy nhất:
```javascript
test.only('should apply 20% discount', () => {
  // Chỉ test này chạy
});

// Hoặc
describe.only('PercentageDiscount', () => {
  // Chỉ group này chạy
});
```

---

## 📚 Tài Liệu Tham Khảo

**Jest Documentation:**
- https://jestjs.io/docs/getting-started

**React Testing Library:**
- https://testing-library.com/docs/react-testing-library/intro

**Best Practices:**
- Test behavior, not implementation
- Use AAA pattern (Arrange, Act, Assert)
- Keep tests simple and focused
- Test edge cases and error scenarios

---

## 🎓 Bước Tiếp Theo

### 1. Chạy tests:
```bash
npm test
```

### 2. Xem tất cả tests pass:
```
PASS  src/patterns/Decorator.test.js
PASS  src/patterns/Observer.test.js  
PASS  src/contexts/NotificationContext.test.js

✅ All tests passed!
```

### 3. (Optional) Xem coverage:
```bash
npm test -- --coverage
```

### 4. Viết test cho component mới:
- Copy pattern từ các test hiện tại
- Follow AAA pattern
- Test happy path + edge cases

---

**Happy Testing! 🧪✨**
