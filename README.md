# SmartStore Management System

A full-stack store management system built with React, Node.js/Express, and MongoDB.
Supports role-based access (super_admin, admin, staff) with features for inventory, billing, customers, suppliers, and reports.

---

## Tech Stack

- **Frontend:** React 19 (Vite), Tailwind CSS, Recharts, Framer Motion
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB Atlas
- **Auth:** JWT with role-based middleware
- **Notifications:** Twilio (SMS & WhatsApp)

---

## Features

- **Authentication:** JWT login with role-based access control
- **Dashboard:** Business intelligence with revenue charts, payment distribution, low stock alerts
- **Inventory:** Product CRUD, bulk CSV upload, expiry tracking with auto-discounting
- **Billing:** POS-style billing with cart, loyalty program, UPI QR, WhatsApp receipts
- **Customers:** Loyalty enrollment, points tracking, transaction history
- **Suppliers:** Vendor management with payment tracking
- **Reports:** Transaction audit with date filters and search
- **User Management:** (Super Admin) Create/edit/delete users, role assignment, permissions

---

## Roles & Permissions

| Feature | Super Admin | Admin | Staff |
|---------|:-----------:|:-----:|:-----:|
| Dashboard | Yes | Yes | Yes |
| Billing | Yes | Yes | Yes |
| Inventory (view) | Yes | Yes | Yes |
| Inventory (add/edit/delete) | Yes | Yes | No |
| Customers | Yes | Yes | Yes |
| Suppliers | Yes | Yes | No |
| Reports | Yes | Yes | No |
| User Management | Yes | No | No |
| Register new users | Yes | No | No |

---

## Project Structure

```
Aparaitech_Bmt_Project/
├── backend/
│   ├── controllers/      # Business logic
│   ├── middleware/        # Auth & role middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express route definitions
│   ├── utils/             # Notification & PDF services
│   ├── server.js          # Entry point
│   └── .env.example       # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/    # Layout, ProtectedRoute
│   │   ├── pages/         # All page components
│   │   ├── services/      # Axios API client
│   │   └── utils/         # Currency, expiry helpers
│   └── .env.example       # Environment template
└── README.md
```

---

## Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Twilio account (optional, for SMS/WhatsApp)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Twilio credentials
npm run dev    # Development (nodemon)
npm start      # Production
```

### Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
npm run build  # Production build
```

### Seed Super Admin

```bash
cd backend
node create-super-admin.js
```

Default credentials: `superadmin@example.com` / `SuperAdmin@123`

---

## Environment Variables

### Backend (.env)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | development / production |
| `JWT_SECRET` | Secret key for JWT tokens |
| `JWT_EXPIRE` | Token expiry (e.g., 7d) |
| `BCRYPT_SALT_ROUNDS` | Password hash rounds (default: 10) |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE` | Twilio phone number |
| `TWILIO_WA_NUMBER` | Twilio WhatsApp number |

---

## API Endpoints

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Login, register, current user |
| `/api/users` | User CRUD (super_admin only) |
| `/api/inventory` | Product CRUD |
| `/api/billing` | Bill creation, refund, WhatsApp |
| `/api/customers` | Customer CRUD |
| `/api/vendors` | Vendor CRUD |
| `/api/dashboard` | Stats, charts, alerts |
| `/api/reports` | Transaction reports |
| `/api/sales` | Direct sales |
| `/api/categories` | Category list |
| `/api/bulk-upload` | CSV inventory import |
| `/api/offers` | Loyalty offers |
