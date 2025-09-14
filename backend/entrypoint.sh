#!/bin/sh

echo "🛠️ Build TypeScript..."
npm run build

echo "⏳ Menunggu database siap..."
sleep 10  # opsional, bisa diganti dengan health check

echo "📦 Prisma migrate..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npm run seed

echo "🚀 Menjalankan server..."
npm run start
