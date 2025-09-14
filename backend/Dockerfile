FROM node:18-alpine

# 1. Set working directory
WORKDIR /app

# 2. Copy dependency files dulu (biar cache build lebih efisien)
COPY package*.json ./

# 3. Install dependencies
RUN npm install

# 4. Copy semua source code
COPY . .

# 5. Build TypeScript
RUN npm run build

# 6. Copy env file (hati-hati: jangan lakukan ini di production!)
# RUN cp .env.example .env

# 7. Generate Prisma client
RUN npx prisma generate

# 8. Copy entrypoint script dan beri izin eksekusi
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 9. Expose port
EXPOSE 3000

# 10. Jalankan entrypoint
CMD ["/entrypoint.sh"]
