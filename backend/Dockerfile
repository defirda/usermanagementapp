FROM node:18

WORKDIR /app
COPY . .

RUN cp .env.example .env
RUN npm install
RUN npx prisma generate

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
CMD ["/entrypoint.sh"]
