# Store Management System

A full-stack Store Management System built using React for the frontend and Node.js + Express for the backend.  
The system helps manage inventory, billing, customers, suppliers, and sales reports.

---

## Features
- Admin authentication
- Inventory & product management
- Billing and invoice generation
- Customer & supplier management
- Sales reports & dashboard
- Responsive UI

---

## Tech Stack
- Frontend: React (Vite), Tailwind CSS
- Backend: Node.js, Express
- Database: MySQL

---
## Project Structure
store-management-system
├── backend
├── frontend
└── README.md

---

## Setup

### Backend
```bash
cd backend
npm install
npm start

Create .env file:
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=store_db
JWT_SECRET=your_secret

## **Frontend Setup**
cd frontend
npm install
npm run dev

Notes:
node_modules, .env, and generated invoices are ignored
This project is for learning and portfolio use

