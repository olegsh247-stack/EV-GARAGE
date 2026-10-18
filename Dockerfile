FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "node scripts/migrate-pg.mjs && node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/seed-catalog.mjs && npm start"]
