import React, { useEffect, useState } from 'react';
import { api, money } from '../api.js';

export default function Shop({ onAdd, isAdmin }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [added, setAdded] = useState('');

  useEffect(() => { api('/products').then(setProducts); }, []);

  const cats = ['All', ...new Set(products.map((p) => p.category))];
  const shown = products.filter(
    (p) => (cat === 'All' || p.category === cat) &&
           (p.name + ' ' + p.description).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="searchbar">
        <input placeholder="🔍 Search medicines, vitamins, devices…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="chips">
        {cats.map((c) => (
          <button key={c} className={'chip ' + (c === cat ? 'active' : '')} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      <div className="grid">
        {shown.map((p) => (
          <div className="card product" key={p.id}>
            <div className="icon">{p.icon}</div>
            <h4>{p.name}</h4>
            <p className="muted small-text">{p.description}</p>
            <div className="meta">
              <span className="tag">{p.category}</span>
              {p.rx && <span className="tag rx">℞ Prescription</span>}
            </div>
            <div className="price-row">
              <b>{money(p.price)}</b>
              <span className={p.stock > 10 ? 'muted' : 'low'}>
                {p.stock === 0 ? 'Out of stock' : p.stock <= 10 ? `Only ${p.stock} left` : 'In stock'}
              </span>
            </div>
            {!isAdmin && (
              <button className="btn" disabled={p.stock === 0}
                onClick={() => { onAdd(p); setAdded(p.id); setTimeout(() => setAdded(''), 900); }}>
                {added === p.id ? '✓ Added' : 'Add to cart'}
              </button>
            )}
          </div>
        ))}
        {shown.length === 0 && <p className="muted">No products found.</p>}
      </div>
    </>
  );
}
