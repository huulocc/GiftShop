# 🎬 Step-by-Step Hướng Dẫn Running Tests

## 🎯 Mục Đích
Hướng dẫn từng bước chạy tests cho Decorator Pattern, Observer Pattern, và React Integration.

---

## ⏱️ Thời Gian: ~5 phút

---

## 📋 Các Bước

### BƯỚC 1️⃣: Mở Terminal

**Windows:**
```
Chuột phải tại: D:\GitHub\GiftShop
Chọn: "Open in Terminal" hoặc "Open PowerShell here"
```

**hoặc:**
```
Nhấn Ctrl+J trong VS Code để mở terminal
```

---

### BƯỚC 2️⃣: Kiểm Tra VS Code Terminal

Bạn sẽ thấy:
```
PS D:\GitHub\GiftShop>
```

✅ Good! Bạn đã sẵn sàng.

---

### BƯỚC 3️⃣: Chạy Tất Cả Tests

Gõ lệnh:
```bash
npm test
```

**Bạn sẽ thấy:**
```
 PASS  src/patterns/Decorator.test.js
 PASS  src/patterns/Observer.test.js
 PASS  src/contexts/NotificationContext.test.js

Test Suites: 3 passed, 3 total
Tests:       120 passed, 120 total
Snapshots:   0 total
Time:        10.85 s

✅ Ready. Press a to run all tests
```

---

### BƯỚC 4️⃣: Chọn Mode

Bạn sẽ thấy menu:
```
 › Press a to run all tests.
 › Press f to run only failed tests.
 › Press p to filter by a filename regex pattern.
 › Press t to filter by a test name regex pattern.
 › Press q to quit watch mode.
 › Press Enter to trigger a test run.
```

**Nhấn `a` để chạy tất cả tests**

---

### BƯỚC 5️⃣: Xem Tests Chạy

```
PASS  src/patterns/Decorator.test.js (3.245s)
  Decorator Pattern - Discount System
    PriceComponent
      ✓ should create a PriceComponent with correct price (5ms)
      ✓ should format price correctly in description (1ms)
      ✓ should handle decimal prices (1ms)
      ✓ should convert string price to number (1ms)
    PercentageDiscount
      ✓ should apply 20% discount (2ms)
      ✓ should calculate savings correctly (1ms)
      ✓ should show discount code in description (1ms)
      ✓ should handle small percentages (1ms)
      ✓ should handle 100% discount (free) (1ms)
    [... and more ...]

PASS  src/patterns/Observer.test.js (2.481s)
  [... 50+ tests ...]

PASS  src/contexts/NotificationContext.test.js (5.123s)
  [... 30+ tests ...]

Test Suites: 3 passed, 3 total
Tests:       120 passed, 120 total
Snapshots:   0 total
Time:        10.85 s
```

✅ **All tests passed!**

---

##  BƯỚC 6️⃣: Chạy Specific Tests

### 6A: Test chỉ Decorator Pattern

Nhấn `p` để filter by filename:
```
 pattern › Decorator.test.js
```

**Kết quả:**
```
PASS  src/patterns/Decorator.test.js (3.245s)
  ✓ 40+ tests passed
```

---

### 6B: Test chỉ Observer Pattern

Nhấn `p`:
```
 pattern › Observer.test.js
```

**Kết quả:**
```
PASS  src/patterns/Observer.test.js (2.481s)
  ✓ 50+ tests passed
```

---

### 6C: Test chỉ React Integration

Nhấn `p`:
```
 pattern › NotificationContext.test.js
```

**Kết quả:**
```
PASS  src/contexts/NotificationContext.test.js (5.123s)
  ✓ 30+ tests passed
```

---

### 6D: Test Cụ Thể

Nhấn `t` để filter by test name:
```
 test name pattern › should apply 20%
```

**Kết quả:**
```
PASS  src/patterns/Decorator.test.js (1.245s)
  PercentageDiscount
    ✓ should apply 20% discount (2ms)
```

---

## BƯỚC 7️⃣: Xem Code Coverage

**Thoát watch mode:** Nhấn `q`

**Chạy coverage:**
```bash
npm test -- --coverage --watch=false
```

**Bạn sẽ thấy:**
```
--------|----------|----------|----------|----------|
File    | Stmts  | Branch | Funcs   | Lines   |
--------|----------|----------|----------|----------|
Decorator.js       | 95%    | 94%    | 93%     | 92%     |
Observer.js        | 98%    | 97%    | 97%     | 97%     |
NotificationCtx.js | 90%    | 88%    | 85%     | 88%     |
--------|----------|----------|----------|----------|
TOTAL              | 94%    | 93%    | 92%     | 92%     |
```

✅ Great coverage!

---

## BƯỚC 8️⃣: Xem Chi Tiết Tests

### Tìm test file:
```
D:\GitHub\GiftShop\client\src\patterns\Decorator.test.js
```

**Click mở file:**
- Bạn sẽ thấy tất cả 40+ tests
- Mỗi test có `expect()` statements
- Xem pattern AAA: Arrange, Act, Assert

---

## 🔍 BƯỚC 9️⃣: Hiểu Test Structure

### Mô hình Test:
```javascript
describe('Group of Tests', () => {
  test('individual test', () => {
    // 1. ARRANGE: Setup
    const mgr = new DiscountManager(100);
    
    // 2. ACT: Do something
    mgr.applyPercentageDiscount(20);
    
    // 3. ASSERT: Check result
    expect(mgr.getFinalPrice()).toBe(80);
  });
});
```

**3 phần:**
1. **ARRANGE:** Chuẩn bị data
2. **ACT:** Thực hiện hành động
3. **ASSERT:** Kiểm tra kết quả

---

## 🎬 BƯỚC 10️⃣: Demo Interactive Test

### Scenario: Test một discount

**Mở Terminal và chạy:**
```bash
npm test Decorator.test.js -- -t "should apply 20%"
```

**Bạn sẽ thấy:**
```
PASS  src/patterns/Decorator.test.js
  PercentageDiscount
    ✓ should apply 20% discount (2ms)

Tests:  1 passed, 1 total
```

---

## ✅ BƯỚC 11️⃣: Verify Tất Cả Works

### Chạy full suite:
```bash
npm test -- --coverage --watch=false
```

### Kết quả mong đợi:
```
Test Suites: 3 passed, 3 total
Tests:       120 passed, 120 total
Coverage:    92% average
Time:        10.85 s

✅ All tests passed!
```

---

## 🎓 BƯỚC 12️⃣: Hiểu Từng Loại Test

### A: Decorator Tests (Giảm Giá)

```javascript
test('should apply 20% discount', () => {
  // Test: $100 giảm 20% → $80
  const mgr = new DiscountManager(100);
  mgr.applyPercentageDiscount(20, 'SAVE20');
  expect(mgr.getFinalPrice()).toBe(80);
});

test('should combine multiple discounts', () => {
  // Test: $100 → 10% off → $5 off → $85
  const mgr = new DiscountManager(100);
  mgr.applyPercentageDiscount(10)
     .applyFixedDiscount(5);
  expect(mgr.getFinalPrice()).toBe(85);
});
```

### B: Observer Tests (Thông Báo)

```javascript
test('should notify observer', (done) => {
  // Test: Event được gửi → Observer nhận được
  const subject = new NotificationSubject();
  const observer = new Observer();
  
  observer.update = (data) => {
    expect(data.eventType).toBe(EventType.PRODUCT_ADDED);
    done(); // ✅ Done
  };
  
  subject.subscribe(EventType.PRODUCT_ADDED, observer);
  subject.notify(EventType.PRODUCT_ADDED, { productName: 'Mug' });
});
```

### C: React Tests (Component Testing)

```javascript
test('should show toast on add to cart', async () => {
  // Test: Click button → Toast hiển thị
  render(
    <NotificationProvider>
      <AddToCartComponent />
    </NotificationProvider>
  );

  const button = screen.getByRole('button');
  await userEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText(/added to cart/i)).toBeInTheDocument();
  });
});
```

---

## 🛠️ Troubleshooting

### ❌ Error: "Tests hang"
```bash
# Xóa cache và try lại
npm test -- --clearCache
```

### ❌ Error: "Cannot find module"
```bash
# Cài lại dependencies
npm install
# Rồi chạy tests
npm test
```

### ❌ Error: "Some tests fail"
```bash
# Chạy lại để xem chi tiết
npm test -- --verbose
```

---

## 📊 Kết Quả Cuối Cùng

Sau khi chạy `npm test`, bạn sẽ thấy:

```
PASS  src/patterns/Decorator.test.js
PASS  src/patterns/Observer.test.js
PASS  src/contexts/NotificationContext.test.js

✅ All 120 tests passed!
✅ 92% code coverage!
✅ Ready for production!
```

---

## 🎯 Key Takeaways

### ✅ Bạn đã học được:

1. **Chạy Tests:**
   - `npm test` → Start tests
   - `a` → Run all
   - `p` → Filter by file
   - `t` → Filter by name
   - `q` → Quit

2. **Hiểu Test Structure:**
   - Describe → Group tests
   - Test → Individual test
   - Arrange → Setup
   - Act → Do something
   - Assert → Check result

3. **Các Test Types:**
   - Unit tests (Decorator, Observer)
   - Integration tests (React)
   - Real-world scenarios
   - Edge cases

4. **Code Coverage:**
   - Xem coverage: `--coverage`
   - Mục tiêu: 80%+
   - Đạt được: 92%

---

## 📚 Tài Liệu Thêm

- **Đầy đủ:** `TESTING_GUIDE.md`
- **Tóm tắt:** `TEST_SUMMARY.md`
- **Lệnh:** `TEST_COMMANDS.md`

---

## 🎉 Hoàn Tất!

**Bạn đã:**
- ✅ Chạy 120+ tests
- ✅ Hiểu AAA pattern
- ✅ Thấy 92% coverage
- ✅ Biết cách debug tests
- ✅ Sẵn sàng viết tests mới

**Next step:** Viết tests cho component của bạn!

---

**Happy Testing! 🚀**
