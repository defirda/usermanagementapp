FROM node:18

# Set working directory
WORKDIR /app

# Salin file dependency dulu (biar cache efisien)
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua source code
COPY . .

# Build project (Next.js akan generate folder .next)
RUN npm run build

# Expose port (Next.js default: 3000, bukan 3001)
EXPOSE 3001

# Jalankan server
CMD ["npm", "run", "start"]
