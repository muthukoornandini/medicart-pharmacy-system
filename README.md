# 💊 MediCart – Online Pharmacy Ordering System

Browse pharmacy products and manage orders. Full-stack, cloud-ready.

| Layer    | Tech                                              |
|----------|---------------------------------------------------|
| Frontend | HTML, CSS, JavaScript, **React.js** (Vite)        |
| Backend  | **Node.js + Express** REST API, JWT auth, bcrypt  |
| Storage  | JSON-file database (no DB install needed)         |
| Deploy   | Docker / Render / Railway / AWS / any VM          |

## Features
**Customers**
- Browse products publicly, search, and filter by category
- Prescription (℞) medicines are flagged; ordering them needs a prescription reference
- Shopping cart with quantity control, stock-limited
- Checkout with address, phone and payment method (pay on delivery)
- "My Orders" with live status (Pending → Confirmed → Shipped → Delivered) and cancel for pending orders

**Admin**
- Dashboard: orders, pending orders, revenue, products, low stock, customers
- Manage orders: update status (cancelling restores stock automatically)
- Manage products: add, edit price/stock, delete

**Security/logic**: hashed passwords, JWT, admin-only routes, order totals and stock are
calculated on the server (the browser can't change prices).

## Run on your laptop (Windows / Mac / Linux)
Requirements: **Node.js 18+** (https://nodejs.org)

```bash
cd pharmacy-system
cd server
npm install
npm start
```
Open **http://localhost:5000** (the React app is already built in `client/dist`).

**Demo logins**
- Customer: `customer@pharmacy.com` / `customer123`
- Admin: `admin@pharmacy.com` / `admin123`

## Development mode (edit React code)
Terminal 1: `cd server && npm install && npm start`
Terminal 2: `cd client && npm install && npm run dev` → http://localhost:5173
Rebuild for production after changes: `cd client && npm run build`

## Deploy to the cloud
```bash
docker build -t medicart .
docker run -p 5000:5000 -e JWT_SECRET=your-secret medicart
```
Render.com (free): push to GitHub → New Web Service → Runtime: Docker. Set `JWT_SECRET`.
(Free tiers reset local files; use a managed DB for permanent data.)

## API summary
`POST /api/auth/register|login` · `GET /api/products` · `POST|PUT|DELETE /api/products` (admin) ·
`POST /api/orders` · `GET /api/orders/me` · `PUT /api/orders/:id/cancel` ·
`GET /api/orders` (admin) · `PUT /api/orders/:id/status` (admin) · `GET /api/stats` (admin) · `GET /api/health`
