import React, { useEffect, useState } from 'react';
import { api, money } from '../api.js';

const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const blank = { name: '', category: '', price: '', stock: '', icon: '💊', description: '', rx: false };

function ProductRow({ p, onSave, onDelete }) {
  const [price, setPrice] = useState(p.price);
  const [stock, setStock] = useState(p.stock);
  return (
    <tr>
      <td>{p.icon} {p.name} {p.rx && <span className="tag rx">℞</span>}</td>
      <td>{p.category}</td>
      <td><input className="mini" type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></td>
      <td><input className="mini" type="number" value={stock} onChange={(e) => setStock(e.target.value)} /></td>
      <td>
        <button className="btn small" onClick={() => onSave(p.id, { price, stock })}>Save</button>{' '}
        <button className="btn small danger-btn" onClick={() => onDelete(p.id)}>Delete</button>
      </td>
    </tr>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('orders');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(blank);
  const [msg, setMsg] = useState('');

  const load = () => {
    api('/stats').then(setStats);
    api('/products').then(setProducts);
    api('/orders').then(setOrders);
  };
  useEffect(load, []);

  const run = async (fn) => { try { await fn(); setMsg(''); load(); } catch (e) { setMsg('❌ ' + e.message); } };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <>
      <h2>Admin Dashboard</h2>
      {stats && (
        <div className="stats">
          <div className="card stat"><b>{stats.orders}</b><span>Orders</span></div>
          <div className="card stat"><b>{stats.pending}</b><span>Pending</span></div>
          <div className="card stat"><b>{money(stats.revenue)}</b><span>Revenue</span></div>
          <div className="card stat"><b>{stats.products}</b><span>Products</span></div>
          <div className="card stat"><b>{stats.lowStock}</b><span>Low stock</span></div>
          <div className="card stat"><b>{stats.customers}</b><span>Customers</span></div>
        </div>
      )}
      <div className="chips">
        <button className={'chip ' + (tab === 'orders' ? 'active' : '')} onClick={() => setTab('orders')}>Manage Orders</button>
        <button className={'chip ' + (tab === 'products' ? 'active' : '')} onClick={() => setTab('products')}>Manage Products</button>
      </div>
      {msg && <div className="error">{msg}</div>}

      {tab === 'orders' && (
        <div className="card">
          {orders.length === 0 && <p className="muted">No orders yet.</p>}
          {orders.map((o) => (
            <div className="order-admin" key={o.id}>
              <div className="row">
                <b>{o.id} · {o.userName}</b>
                <select value={o.status} onChange={(e) => run(() => api(`/orders/${o.id}/status`, 'PUT', { status: e.target.value }))}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="small-text">{o.items.map((l) => `${l.name} × ${l.qty}`).join(', ')}</div>
              <div className="small-text muted">
                {money(o.total)} · {o.payment} · 📞 {o.phone} · 📍 {o.address}
                {o.prescriptionRef && <> · ℞ {o.prescriptionRef}</>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'products' && (
        <>
          <form className="card" onSubmit={(e) => { e.preventDefault(); run(async () => { await api('/products', 'POST', form); setForm(blank); }); }}>
            <h3>Add Product</h3>
            <input placeholder="Product name" value={form.name} onChange={set('name')} required />
            <input placeholder="Category (e.g. Vitamins)" value={form.category} onChange={set('category')} required />
            <input placeholder="Description" value={form.description} onChange={set('description')} />
            <div className="optrow">
              <input type="number" min="0" placeholder="Price (₹)" value={form.price} onChange={set('price')} required />
              <input type="number" min="0" placeholder="Stock" value={form.stock} onChange={set('stock')} required />
              <input placeholder="Emoji icon" value={form.icon} onChange={set('icon')} />
            </div>
            <label><input type="checkbox" checked={form.rx} onChange={set('rx')} /> Prescription required</label>
            <button className="btn">Add Product</button>
          </form>
          <div className="card">
            <table>
              <thead><tr><th>Product</th><th>Category</th><th>Price ₹</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <ProductRow key={p.id + p.price + p.stock} p={p}
                    onSave={(id, d) => run(() => api('/products/' + id, 'PUT', d))}
                    onDelete={(id) => window.confirm('Delete this product?') && run(() => api('/products/' + id, 'DELETE'))} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
