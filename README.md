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

⚡ Redis Caching
User data is cached for 1 minutes to reduce database load.

Request ID middleware adds X-Request-Id to every response for traceability.

## 🚀 Setup UP With Docker
- git clone https://github.com/defirda/usermanagementapp.git
- cd usermanagementapp
- run docker-compose up -d


## User Login
- cari username di mysql table users, gunakan username dan passwordnya adalah password123


👤 Author
Made with ❤️ by Muhammad Ade Firdaus