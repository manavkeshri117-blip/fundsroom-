# FundsRoom Mini ERP + CRM Operations Portal

A transformed full-stack case-study project based on the existing JavaScript/Express/MongoDB learning codebase.

## Tech stack
- React + JavaScript
- Node.js + Express + JavaScript
- MongoDB + Mongoose
- JWT authentication
- REST APIs
- Responsive CSS

## Core modules
- Authentication and role-based access: Admin, Sales, Warehouse, Accounts
- Customer CRM: add, edit, search, customer details and follow-ups
- Product and inventory management
- Stock IN/OUT movement audit log
- Sales challans with Draft, Confirmed and Cancelled states
- Stock validation and negative-stock prevention
- Product snapshot data in challan items
- Dashboard metrics and low-stock alerts
- Pagination/search support in customer API

## Project structure
```text
FundsRoom/
├── backend/      Express REST API + Mongoose models
├── dashboard/    Main React operations portal
├── frontend/     Public landing page
├── docs/         Architecture and interview notes
└── postman-FundsRoom.json
```

## Local setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
```
Set `MONGO_URL` and `JWT_SECRET` in `.env`.

Then seed demo data:
```bash
npm run seed
```
Start the API:
```bash
npm run dev
```
API: `http://localhost:3002`

### Dashboard
```bash
cd dashboard
npm install
npm start
```
Dashboard: `http://localhost:3001`

### Public landing page
```bash
cd frontend
npm install
npm start
```
The landing page contains an entry point to the operations portal. For deployment, change its portal URL from localhost to the deployed dashboard URL.

## Demo accounts
Password for all demo accounts: `FundsRoom@123`

- `admin@fundsroom.local` — ADMIN
- `sales@fundsroom.local` — SALES
- `warehouse@fundsroom.local` — WAREHOUSE
- `accounts@fundsroom.local` — ACCOUNTS

## Main API routes
- `POST /api/auth/login`
- `GET/POST /api/customers`
- `GET/PUT/DELETE /api/customers/:id`
- `POST /api/customers/:id/followups`
- `GET/POST /api/products`
- `GET/PUT /api/products/:id`
- `POST /api/inventory/stock-in`
- `POST /api/inventory/stock-out`
- `GET /api/inventory/movements`
- `GET/POST /api/challans`
- `POST /api/challans/:id/confirm`
- `POST /api/challans/:id/cancel`
- `GET /api/dashboard/summary`
- `GET/POST /api/users` (Admin only)

## Core business flow
1. Sales creates a customer or selects an existing customer.
2. Sales creates a challan draft with one or more products.
3. The backend copies product name, SKU and price into the challan item as a historical snapshot.
4. On confirmation, the backend checks available stock for every item.
5. If stock is insufficient, confirmation fails and stock is not reduced.
6. If stock is sufficient, stock is reduced and OUT movement records are created.
7. The challan becomes Confirmed.

## Environment variables
Never commit `.env` to GitHub. Use `.env.example` as the template.

Backend:
```text
PORT=3002
MONGO_URL=mongodb://127.0.0.1:27017/fundsroom
JWT_SECRET=change_this_in_production
CLIENT_URL=http://localhost:3000
```

Dashboard:
```text
REACT_APP_API_URL=http://localhost:3002/api
```

## Deployment
For a production submission, use MongoDB Atlas for the database, Render/Railway for the backend and Vercel/Netlify/Render for the frontend. Store secrets as platform environment variables.

The challan confirmation code uses a MongoDB session transaction. Use MongoDB Atlas or another replica-set deployment for production transaction support.

## Known limitation
The assignment document lists PostgreSQL/MySQL as its database choices. This implementation deliberately uses MongoDB/Mongoose because that is the developer's existing learning stack and allows the project to be understood and defended confidently. If FundsRoom strictly enforces the listed database options, the Mongoose persistence layer should be migrated before final submission.

## Documentation
- `docs/architecture.md`
- `docs/interview-notes.md`
- `postman-FundsRoom.json`
