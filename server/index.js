const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'pharmacy-dev-secret-change-me';
const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

app.use(cors());
app.use(express.json());

// ---------- helpers ----------
const sign = (u) => jwt.sign({ id: u.id, role: u.role, name: u.name }, SECRET, { expiresIn: '8h' });
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });
function auth(req, res, next) {
  try {
    req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Please log in to continue.' });
  }
}
const adminOnly = (req, res, next) =>
  req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admins only.' });

function restoreStock(order) {
  order.items.forEach((l) => {
    const p = store.get().products.find((x) => x.id === l.productId);
    if (p) p.stock += l.qty;
  });
}

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'Online Pharmacy' }));

// ---------- auth ----------
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ error: 'Name, email and a password (6+ chars) are required.' });
  const db = store.get();
  if (db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()))
    return res.status(409).json({ error: 'Email already registered.' });
  const user = { id: store.id(), name, email, password: bcrypt.hashSync(password, 10), role: 'customer' };
  db.users.push(user);
  store.save();
  res.json({ token: sign(user), user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = store.get().users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user || !bcrypt.compareSync(password || '', user.password))
    return res.status(401).json({ error: 'Invalid email or password.' });
  res.json({ token: sign(user), user: publicUser(user) });
});

// ---------- products (browsing is public) ----------
app.get('/api/products', (req, res) => res.json(store.get().products));

function cleanProduct(b) {
  return {
    name: String(b.name || '').trim(), category: String(b.category || 'General').trim(),
    price: Number(b.price), stock: parseInt(b.stock), rx: !!b.rx,
    icon: b.icon || '💊', description: b.description || ''
  };
}

app.post('/api/products', auth, adminOnly, (req, res) => {
  const p = cleanProduct(req.body);
  if (!p.name || !(p.price >= 0) || !(p.stock >= 0))
    return res.status(400).json({ error: 'Name, valid price and stock are required.' });
  const product = { id: store.id(), ...p };
  store.get().products.push(product);
  store.save();
  res.json(product);
});

app.put('/api/products/:id', auth, adminOnly, (req, res) => {
  const p = store.get().products.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found.' });
  const upd = cleanProduct({ ...p, ...req.body });
  if (!upd.name || !(upd.price >= 0) || !(upd.stock >= 0))
    return res.status(400).json({ error: 'Invalid price or stock.' });
  Object.assign(p, upd);
  store.save();
  res.json(p);
});

app.delete('/api/products/:id', auth, adminOnly, (req, res) => {
  store.get().products = store.get().products.filter((x) => x.id !== req.params.id);
  store.save();
  res.json({ ok: true });
});

// ---------- orders ----------
app.post('/api/orders', auth, (req, res) => {
  const { items, address, phone, payment, prescriptionRef } = req.body;
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Your cart is empty.' });
  if (!address || !phone) return res.status(400).json({ error: 'Delivery address and phone are required.' });

  const db = store.get();
  const lines = [];
  let total = 0, needsRx = false;
  for (const it of items) {
    const p = db.products.find((x) => x.id === it.productId);
    const qty = parseInt(it.qty);
    if (!p || !(qty > 0)) return res.status(400).json({ error: 'Invalid item in cart.' });
    if (p.stock < qty) return res.status(400).json({ error: `Only ${p.stock} left of ${p.name}.` });
    if (p.rx) needsRx = true;
    lines.push({ productId: p.id, name: p.name, price: p.price, qty });
    total += p.price * qty;
  }
  if (needsRx && !(prescriptionRef || '').trim())
    return res.status(400).json({ error: 'Your cart has prescription medicines. Please enter your prescription reference.' });

  lines.forEach((l) => { db.products.find((p) => p.id === l.productId).stock -= l.qty; });
  const order = {
    id: 'ORD' + Date.now().toString().slice(-7), userId: req.user.id, userName: req.user.name,
    items: lines, total, address, phone, payment: payment || 'Cash on Delivery',
    prescriptionRef: (prescriptionRef || '').trim(), status: 'Pending', date: new Date().toISOString()
  };
  db.orders.push(order);
  store.save();
  res.json(order);
});

app.get('/api/orders/me', auth, (req, res) =>
  res.json(store.get().orders.filter((o) => o.userId === req.user.id).reverse()));

app.put('/api/orders/:id/cancel', auth, (req, res) => {
  const o = store.get().orders.find((x) => x.id === req.params.id && x.userId === req.user.id);
  if (!o) return res.status(404).json({ error: 'Order not found.' });
  if (o.status !== 'Pending') return res.status(400).json({ error: 'Only pending orders can be cancelled.' });
  o.status = 'Cancelled';
  restoreStock(o);
  store.save();
  res.json(o);
});

// ---------- admin ----------
app.get('/api/orders', auth, adminOnly, (req, res) => res.json([...store.get().orders].reverse()));

app.put('/api/orders/:id/status', auth, adminOnly, (req, res) => {
  const o = store.get().orders.find((x) => x.id === req.params.id);
  const { status } = req.body;
  if (!o) return res.status(404).json({ error: 'Order not found.' });
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  if (o.status === 'Cancelled' && status !== 'Cancelled') return res.status(400).json({ error: 'Cancelled orders cannot be reopened.' });
  if (status === 'Cancelled' && o.status !== 'Cancelled') restoreStock(o);
  o.status = status;
  store.save();
  res.json(o);
});

app.get('/api/stats', auth, adminOnly, (req, res) => {
  const { products, orders, users } = store.get();
  res.json({
    products: products.length,
    customers: users.filter((u) => u.role === 'customer').length,
    orders: orders.length,
    pending: orders.filter((o) => o.status === 'Pending').length,
    revenue: orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0),
    lowStock: products.filter((p) => p.stock <= 10).length
  });
});

// ---------- serve React build ----------
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (_, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  app.get('/', (_, res) => res.send('API running. Build the client first: npm run build --prefix client'));
}

app.listen(PORT, () => console.log(`Online Pharmacy running at http://localhost:${PORT}`));
