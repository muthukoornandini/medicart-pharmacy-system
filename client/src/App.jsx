import React, { useState } from 'react';
import Auth from './pages/Auth.jsx';
import Shop from './pages/Shop.jsx';
import Cart from './pages/Cart.jsx';
import Orders from './pages/Orders.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ph_user') || 'null'));
  const [view, setView] = useState('shop');
  const [cart, setCart] = useState([]); // [{ product, qty }]

  const login = ({ token, user }) => {
    localStorage.setItem('ph_token', token);
    localStorage.setItem('ph_user', JSON.stringify(user));
    setUser(user);
    setView(user.role === 'admin' ? 'admin' : cart.length ? 'cart' : 'shop');
  };
  const logout = () => { localStorage.clear(); setUser(null); setCart([]); setView('shop'); };

  const addToCart = (product) =>
    setCart((c) => {
      const f = c.find((x) => x.product.id === product.id);
      if (f) return c.map((x) => (x.product.id === product.id ? { ...x, qty: Math.min(x.qty + 1, product.stock) } : x));
      return [...c, { product, qty: 1 }];
    });
  const setQty = (id, qty) =>
    setCart((c) => c.map((x) => (x.product.id === id ? { ...x, qty: Math.max(1, Math.min(qty, x.product.stock)) } : x)));
  const remove = (id) => setCart((c) => c.filter((x) => x.product.id !== id));

  const count = cart.reduce((s, x) => s + x.qty, 0);

  if (view === 'auth') return <Auth onLogin={login} onBack={() => setView('shop')} />;

  return (
    <>
      <nav className="nav">
        <h1 onClick={() => setView('shop')}>💊 MediCart</h1>
        <div>
          <button className="link" onClick={() => setView('shop')}>Shop</button>
          {user?.role !== 'admin' && <button className="link" onClick={() => setView('cart')}>🛒 Cart ({count})</button>}
          {user?.role === 'customer' && <button className="link" onClick={() => setView('orders')}>My Orders</button>}
          {user?.role === 'admin' && <button className="link" onClick={() => setView('admin')}>Admin</button>}
          {user ? (
            <>
              <span className="who">{user.name}</span>
              <button className="btn small" onClick={logout}>Logout</button>
            </>
          ) : (
            <button className="btn small" onClick={() => setView('auth')}>Login / Sign up</button>
          )}
        </div>
      </nav>
      <main className="container">
        {view === 'shop' && <Shop onAdd={addToCart} isAdmin={user?.role === 'admin'} />}
        {view === 'cart' && (
          <Cart cart={cart} setQty={setQty} remove={remove} user={user}
            onLogin={() => setView('auth')}
            onPlaced={() => { setCart([]); setView('orders'); }} />
        )}
        {view === 'orders' && user && <Orders />}
        {view === 'admin' && user?.role === 'admin' && <Admin />}
      </main>
    </>
  );
}
