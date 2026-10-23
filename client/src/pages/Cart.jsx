import React, { useState } from 'react';
import { api, money } from '../api.js';

export default function Cart({ cart, setQty, remove, user, onLogin, onPlaced }) {
  const [form, setForm] = useState({ address: '', phone: '', payment: 'Cash on Delivery', prescriptionRef: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const total = cart.reduce((s, x) => s + x.product.price * x.qty, 0);
  const needsRx = cart.some((x) => x.product.rx);

  const place = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/orders', 'POST', {
        ...form, items: cart.map((x) => ({ productId: x.product.id, qty: x.qty }))
      });
      onPlaced();
    } catch (err) { setError(err.message); }
  };

  if (!cart.length) return <div className="card"><h2>🛒 Your cart is empty</h2><p className="muted">Browse the shop and add some products.</p></div>;

  return (
    <>
      <h2>🛒 Your Cart</h2>
      <div className="card">
        <table>
          <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead>
          <tbody>
            {cart.map(({ product: p, qty }) => (
              <tr key={p.id}>
                <td>{p.icon} {p.name} {p.rx && <span className="tag rx">℞</span>}</td>
                <td>{money(p.price)}</td>
                <td>
                  <button className="qty" onClick={() => setQty(p.id, qty - 1)}>−</button>
                  <span className="qnum">{qty}</span>
                  <button className="qty" onClick={() => setQty(p.id, qty + 1)}>+</button>
                </td>
                <td>{money(p.price * qty)}</td>
                <td><button className="btn small danger-btn" onClick={() => remove(p.id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 className="right">Total: {money(total)}</h3>
      </div>

      {!user ? (
        <div className="card center">
          <p>Please log in to place your order.</p>
          <button className="btn" onClick={onLogin}>Login / Sign up</button>
        </div>
      ) : (
        <form className="card" onSubmit={place}>
          <h3>Delivery Details</h3>
          <input placeholder="Delivery address" value={form.address} onChange={set('address')} required />
          <input placeholder="Phone number" value={form.phone} onChange={set('phone')} required />
          <select value={form.payment} onChange={set('payment')}>
            <option>Cash on Delivery</option><option>UPI on Delivery</option><option>Card on Delivery</option>
          </select>
          {needsRx && (
            <>
              <input placeholder="Prescription reference / doctor's Rx number (required)" value={form.prescriptionRef} onChange={set('prescriptionRef')} />
              <small className="muted">Your cart has prescription (℞) medicines. Please keep the prescription ready for the delivery agent.</small>
            </>
          )}
          {error && <div className="error">{error}</div>}
          <button className="btn">Place Order · {money(total)}</button>
        </form>
      )}
    </>
  );
}
