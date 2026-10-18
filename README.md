# EV-GARAGE

Каталог электромобилей. Приложение, PostgreSQL и фотографии рассчитаны на один хост.

## Локально

```bash
docker compose up -d postgres
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

Скопируйте `.env.example` в `.env` и задайте `DATABASE_URL`, `ADMIN_PASSWORD`, `PHOTOS_DIR`.

Проверка production-сборки: `npm run build`, затем `npm start`.
