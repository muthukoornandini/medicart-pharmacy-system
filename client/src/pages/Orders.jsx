import React, { useEffect, useState } from 'react';
import { api, money } from '../api.js';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState('');
  const load = () => api('/orders/me').then(setOrders);
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try { await api(`/orders/${id}/cancel`, 'PUT'); setMsg(''); load(); }
    catch (e) { setMsg(e.message); }
  };

  return (
    <>
      <h2>My Orders</h2>
      {msg && <div className="error">{msg}</div>}
      {orders.length === 0 && <div className="card muted">You haven't placed any orders yet.</div>}
      {orders.map((o) => (
        <div className="card" key={o.id}>
          <div className="row">
            <b>{o.id} <span className="muted">· {new Date(o.date).toLocaleString()}</span></b>
            <span className={'status ' + o.status}>{o.status}</span>
          </div>
          <ul>{o.items.map((l, i) => <li key={i}>{l.name} × {l.qty} — {money(l.price * l.qty)}</li>)}</ul>
          <div className="row">
            <span className="muted">📍 {o.address} · {o.payment}</span>
            <b>{money(o.total)}</b>
          </div>
          {o.status === 'Pending' && <button className="btn small danger-btn" onClick={() => cancel(o.id)}>Cancel order</button>}
        </div>
      ))}
    </>
  );
}
