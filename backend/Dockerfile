FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --omit=dev
RUN npx prisma generate
COPY --from=base /app/dist ./dist
EXPOSE 4000
CMD ["sh", "-c", "(npx prisma migrate deploy || echo 'migrate deploy failed - continuing so the server can still boot and report a real error') && node dist/server.js"]
