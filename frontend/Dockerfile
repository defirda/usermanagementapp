# Gunakan Node.js 24 dengan Alpine Linux sebagai base image
FROM node:18-alpine

# Set working directory di dalam container
WORKDIR /app

# Copy package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh source code ke dalam container
COPY . .

# Build aplikasi Next.js untuk production
RUN npm run build

# Expose port 3000 (port default Next.js)
EXPOSE 3000

# Set environment variable untuk production
ENV NODE_ENV=production

# Jalankan aplikasi
CMD ["npm", "start"]