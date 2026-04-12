const STORAGE_KEY = 'giftshop-cart';
const LAST_PAYMENT_KEY = 'giftshop-last-payment';

const isBrowser = typeof window !== 'undefined';

function readJson(key, fallback) {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (!isBrowser) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getCartItems() {
  return readJson(STORAGE_KEY, []);
}

export function saveCartItems(items) {
  writeJson(STORAGE_KEY, items);
  return items;
}

export function addCartItem(item) {
  const currentItems = getCartItems();
  const existingIndex = currentItems.findIndex((currentItem) => String(currentItem.id) === String(item.id));

  const normalizedItem = {
    id: item.id,
    name: item.name,
    price: Number(item.price) || 0,
    thumbnail: item.thumbnail || '',
    brand: item.brand || '',
    category: item.category || '',
    quantity: 1,
  };

  if (existingIndex >= 0) {
    const updatedItems = currentItems.map((currentItem, index) => (
      index === existingIndex
        ? { ...currentItem, quantity: Number(currentItem.quantity || 1) + 1 }
        : currentItem
    ));
    return saveCartItems(updatedItems);
  }

  return saveCartItems([...currentItems, normalizedItem]);
}

export function updateCartItemQuantity(itemId, quantity) {
  const nextQuantity = Math.max(1, Number(quantity) || 1);
  const updatedItems = getCartItems().map((item) => (
    String(item.id) === String(itemId)
      ? { ...item, quantity: nextQuantity }
      : item
  ));
  return saveCartItems(updatedItems);
}

export function removeCartItem(itemId) {
  const updatedItems = getCartItems().filter((item) => String(item.id) !== String(itemId));
  return saveCartItems(updatedItems);
}

export function clearCart() {
  return saveCartItems([]);
}

export function getCartCount() {
  return getCartItems().reduce((total, item) => total + Number(item.quantity || 1), 0);
}

export function calculateCartSubtotal(items = []) {
  return items.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 1), 0);
}

export function saveLastPayment(payment) {
  writeJson(LAST_PAYMENT_KEY, payment);
  return payment;
}

export function getLastPayment() {
  return readJson(LAST_PAYMENT_KEY, null);
}
