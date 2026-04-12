import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CartPage.scss';
import {
  calculateCartSubtotal,
  clearCart,
  getCartItems,
  removeCartItem,
  saveLastPayment,
  updateCartItemQuantity,
} from '../../services/cartService';

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [coupon, setCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [error, setError] = useState('');

  useEffect(() => {
    const items = getCartItems();
    setCartItems(items);
    setSelectedIds(items.map((item) => item.id));
  }, []);

  const selectedItems = useMemo(
    () => cartItems.filter((item) => selectedIds.includes(item.id)),
    [cartItems, selectedIds]
  );

  const subtotal = useMemo(() => calculateCartSubtotal(selectedItems), [selectedItems]);
  const discount = useMemo(() => {
    if (!coupon.trim()) return 0;
    return Math.min(subtotal * 0.1, subtotal);
  }, [coupon, subtotal]);
  const tax = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);
  const grandTotal = Math.max(0, subtotal - discount + tax);

  const updateCartState = (nextItems) => {
    setCartItems(nextItems);
    setSelectedIds((currentSelectedIds) =>
      currentSelectedIds.filter((id) => nextItems.some((item) => item.id === id))
    );
  };

  const toggleSelectAll = (event) => {
    setSelectedIds(event.target.checked ? cartItems.map((item) => item.id) : []);
  };

  const toggleItem = (itemId) => {
    setSelectedIds((currentSelectedIds) =>
      currentSelectedIds.includes(itemId)
        ? currentSelectedIds.filter((id) => id !== itemId)
        : [...currentSelectedIds, itemId]
    );
  };

  const handleQuantityChange = (itemId, quantity) => {
    const nextItems = updateCartItemQuantity(itemId, quantity);
    updateCartState(nextItems);
  };

  const handleRemoveItem = (itemId) => {
    const nextItems = removeCartItem(itemId);
    updateCartState(nextItems);
  };

  const handleClearAll = () => {
    const nextItems = clearCart();
    updateCartState(nextItems);
  };

  const handleCheckout = (event) => {
    event.preventDefault();
    setError('');

    if (selectedItems.length === 0) {
      setError('Please select at least one item before checkout.');
      return;
    }

    const payment = {
      orderid: `ORD-${Date.now()}`,
      requestid: `REQ-${Date.now()}`,
      transid: `TRANS-${Date.now()}`,
      payment_method: paymentMethod,
      payment_status: 'completed',
      amount: Math.round(grandTotal),
      items: selectedItems,
    };

    saveLastPayment(payment);
    navigate('/payment/return', { state: { payment } });
  };

  const allSelected = cartItems.length > 0 && selectedIds.length === cartItems.length;

  return (
    <section className="cart-page py-5">
      <div className="container">
        <form id="checkoutForm" onSubmit={handleCheckout}>
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="mb-0">Shopping Cart</h4>
              </div>

              {error && <div className="cart-alert">{error}</div>}

              <div className="card shadow-sm border-0 rounded-4">
                <div className="card-header border-0 p-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="selectAll"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                    />
                    <label className="form-check-label fw-medium" htmlFor="selectAll">
                      Select all
                    </label>
                  </div>
                </div>

                <ul className="list-group list-group-flush cart-list">
                  {cartItems.length === 0 && (
                    <li className="list-group-item p-4 text-center text-muted">
                      Your cart is empty. Browse products and add items first.
                    </li>
                  )}

                  {cartItems.map((item) => {
                    const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);

                    return (
                      <li className="list-group-item p-3 cart-item" key={item.id}>
                        <div className="row g-3 align-items-center">
                          <div className="col-auto">
                            <input
                              className="form-check-input item-check"
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => toggleItem(item.id)}
                            />
                          </div>
                          <div className="col d-flex align-items-center gap-3">
                            <div className="col-auto">
                              <div className="cart-thumb-wrap">
                                <img
                                  src={item.thumbnail || '/logo192.png'}
                                  className="rounded img-thumb"
                                  alt={item.name}
                                />
                              </div>
                            </div>
                            <div className="col">
                              <h6 className="mb-1">{item.name}</h6>
                              <div className="text-muted small">
                                {item.brand ? `${item.brand}` : 'Gift product'}
                              </div>
                            </div>
                          </div>
                          <div className="col-12 col-md-auto text-md-end">
                            <div className="text-decoration-line-through small text-muted mb-1">
                              ${formatMoney(itemTotal)}
                            </div>
                            <div className="fw-semibold price">${formatMoney(itemTotal)}</div>
                            <div className="cart-quantity-row">
                              <label htmlFor={`qty-${item.id}`} className="small text-muted me-2">
                                Qty
                              </label>
                              <input
                                id={`qty-${item.id}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(event) => handleQuantityChange(item.id, event.target.value)}
                                className="cart-qty-input"
                              />
                            </div>
                            <button
                              className="btn btn-sm btn-outline-danger mt-2"
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-3 d-flex gap-2 flex-wrap">
                <Link to="/" className="btn btn-outline-secondary">
                  Continue shopping
                </Link>
                <button className="btn btn-outline-danger ms-auto" type="button" onClick={handleClearAll}>
                  Clear all
                </button>
              </div>
            </div>

            <aside className="col-lg-4">
              <div className="card shadow-sm border-0 rounded-4 position-sticky top-20">
                <div className="card-body">
                  <h5 className="card-title mb-3">Order Summary</h5>
                  <div className="d-flex justify-content-between small mb-2">
                    <span>Selected items</span>
                    <span>{selectedItems.length}</span>
                  </div>
                  <div className="d-flex justify-content-between small mb-2">
                    <span>Subtotal</span>
                    <span>${formatMoney(subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between small mb-2">
                    <span>Discount</span>
                    <span>${formatMoney(discount)}</span>
                  </div>
                  <div className="d-flex justify-content-between small mb-2">
                    <span>Tax</span>
                    <span>${formatMoney(tax)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-semibold mb-3">
                    <span>Total</span>
                    <span>${formatMoney(grandTotal)}</span>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="coupon" className="form-label small">Coupon code</label>
                    <div className="input-group">
                      <input
                        id="coupon"
                        type="text"
                        className="form-control"
                        placeholder="ENTERCODE…"
                        value={coupon}
                        onChange={(event) => setCoupon(event.target.value)}
                      />
                      <button className="btn btn-outline-secondary" type="button">
                        Apply
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small">Payment method</label>
                    <div className="list-group">
                      <label className="list-group-item">
                        <input
                          className="form-check-input me-2"
                          type="radio"
                          name="payment_method"
                          value="momo"
                          checked={paymentMethod === 'momo'}
                          onChange={() => setPaymentMethod('momo')}
                        />
                        MoMo QR
                      </label>
                    </div>
                  </div>

                  <button id="btnCheckout" className="btn btn-primary w-100 btn-lg" type="submit">
                    Proceed to checkout
                  </button>

                  <p className="small text-muted mt-3 mb-0">
                    By clicking “Proceed to checkout”, you agree to our Terms of Service and Refund Policy.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </section>
  );
}

export default CartPage;