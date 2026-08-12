# FundsRoom Mini ERP + CRM Operations Portal

This project transforms the original learning codebase into a business operations portal aligned to the FundsRoom Full Stack Developer case study.

## Stack
- React + JavaScript
- Node.js + Express + JavaScript
- MongoDB + Mongoose
- JWT authentication
- REST APIs
- CSS responsive UI

## Modules
- Authentication and role-based access: Admin, Sales, Warehouse, Accounts
- Customer CRM: add, edit, search, details and follow-ups
- Product and inventory management
- Stock IN/OUT movement audit log
- Sales challans: Draft, Confirmed, Cancelled
- Stock validation and prevention of negative stock
- Product snapshot data inside challan items
- Dashboard metrics, low-stock alerts and recent activity
- Pagination/search support in customer API

## Architecture
React frontend -> Express REST API -> Mongoose -> MongoDB Atlas/local MongoDB.

The dashboard is the main case-study portal. The `frontend` folder is a small public landing page.

## Local setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
```
Set `MONGO_URL` and `JWT_SECRET` in `.env`, then:
```bash
npm run seed
npm run dev
```
API runs on `http://localhost:3002`.

### 2. Dashboard
```bash
cd dashboard
npm install
npm start
```
Dashboard runs on `http://localhost:3001` if port 3001 is available.

### 3. Public landing page
```bash
cd frontend
npm install
npm start
```
If React chooses another port, use that URL. The landing page's portal button points to the dashboard URL and can be changed for deployment.

## Demo accounts
All demo accounts use password `FundsRoom@123`:
- admin@fundsroom.local
- sales@fundsroom.local
- warehouse@fundsroom.local
- accounts@fundsroom.local

## Important business rule
A challan is saved as Draft first. On confirmation, the API checks each item's available stock. Stock is reduced only when enough stock exists; otherwise the confirmation is rejected and the stock is not reduced. Stock OUT movements are recorded for confirmed challans.

## API overview
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

## Deployment
The case study permits free hosting platforms. A production deployment should use a managed MongoDB instance such as MongoDB Atlas, a backend host such as Render, and a frontend host such as Vercel/Netlify. Keep secrets in platform environment variables.

## Known limitations
- The project uses MongoDB because it matches the existing learning stack and the developer can confidently explain it. If the evaluator strictly requires PostgreSQL/MySQL, the persistence layer should be migrated before submission.
- PDF invoice export, S3 product uploads and CI/CD are not included in the core build.
- Production should use MongoDB Atlas replica-set support for the transaction-based challan confirmation path.
