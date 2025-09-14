# 🧩 Fullstack User Management App

A full-featured web application for managing users, built with:

- **Backend:** Node.js 18, Express, Prisma ORM, MySQL, Redis  
- **Frontend:** Next.js  
- **Features:** Authentication, CSV export, caching, responsive UI

---

## 🚀 Features

- RESTful API with Express
- JWT-based Authentication
- MySQL database with Prisma ORM
- Redis for caching and session tracking
- CSV export endpoint
- Request ID middleware
- React frontend with Axios & React Router
- Unit & Integration tests with Jest and Supertest

---

Code

---

## ⚙️ Backend Setup

### 1. Install dependencies

```bash
cd backend
npm install
2. Configure environment
Copy .env.example to .env and set your variables:

// MySQL dengan user: root, password: root123 port3306, dbname: backend_api
// Redis dengan password rahasia123

env
PORT=5000
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your_jwt_secret"

3. Prisma setup
bash
npx prisma generate
npx prisma migrate dev --name init
4. Run server
bash
npm run dev
API will be available at http://localhost:5000

💻 Frontend Setup
1. Install dependencies
bash
cd frontend
npm install

env
VITE_API_URL="http://localhost:5000"
3. Run frontend
bash
npm run dev
App will be available at http://localhost:3000

🧪 Testing
Backend
bash
npm run test
Uses Jest + Supertest for integration testing.

📤 CSV Export
Endpoint: GET /api/users/export/csv Response: downloadable CSV file containing user data.

⚡ Redis Caching
User data is cached for 5 minutes to reduce database load.

Request ID middleware adds X-Request-Id to every response for traceability.


Setup UP With Docker



👤 Author
Made with ❤️ by Muhammad Ade Firdaus