import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PaymentResult.scss';

function PaymentResult() {
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const payment = useMemo(() => {
    if (location.state?.payment) {
      return location.state.payment;
    }

    const requestId = searchParams.get('requestId') || searchParams.get('requestid');
    if (requestId) {
      const resultCode = Number(searchParams.get('resultCode') || '0');
      const completedFromResultCode = resultCode === 0 ? 'completed' : 'failed';

      return {
        orderid: searchParams.get('orderId') || searchParams.get('orderid') || '',
        requestid: requestId,
        transid: searchParams.get('transId') || searchParams.get('transid') || '',
        payment_method: searchParams.get('paymentMethod') || searchParams.get('payment_method') || 'momo',
        payment_status:
          searchParams.get('paymentStatus') ||
          searchParams.get('payment_status') ||
          completedFromResultCode,
        amount: searchParams.get('amount') || '0',
      };
    }

    return null;
  }, [location.state, searchParams]);

  const success = payment?.payment_status === 'completed';

  return (
    <div className="payment-result-page py-5">
      <div className="container">
        <div className="payment-result-card shadow-sm">
          <div className="payment-result-header">
            <div>
              <p className="payment-result-kicker">Kết quả thanh toán</p>
              <h3 className="mb-0">Payment result</h3>
            </div>
            <span className={`payment-result-badge ${success ? 'success' : 'failed'}`}>
              {success ? 'Success' : 'Failed'}
            </span>
          </div>

          {payment ? (
            <ul className="list-group text-dark payment-result-list">
              <li className="list-group-item"><b>orderid:</b> {payment.orderid}</li>
              <li className="list-group-item"><b>requestid:</b> {payment.requestid}</li>
              <li className="list-group-item"><b>transid:</b> {payment.transid}</li>
              <li className="list-group-item"><b>payment_method:</b> {payment.payment_method}</li>
              <li className="list-group-item"><b>payment_status:</b> {payment.payment_status}</li>
              <li className="list-group-item"><b>amount:</b> {payment.amount} VND</li>
            </ul>
          ) : (
            <p className="mb-0">Không tìm thấy bản ghi thanh toán (thiếu requestId trên URL).</p>
          )}

          <div className="payment-result-actions">
            <Link className="btn btn-secondary" to="/">Back</Link>
            <Link className="btn btn-outline-primary" to="/cart">Go to cart</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentResult;