# Stage A — Cloudflare D1 (каталог)

Цель: создать БД, схему, импортировать `cars.ts`. Сайт пока читает файл, не D1.

## Нужен API-токен с D1

Текущий токен Worker/KV **не** открывает D1 (`Authentication error 10000`).

Создай токен: https://dash.cloudflare.com/profile/api-tokens → Create Token → Custom token

Права (минимум):
- **Account → Cloudflare D1 → Edit**
- **Account → Workers Scripts → Edit** (уже было)
- **Account → Workers KV Storage → Edit** (уже было)
- Account resources: Include → твой аккаунт

Пришли новый токен — доделаем create + migrate + seed.

## Команды (после токена)

```bash
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=014e0964322f6dcdccc71c59ea49b0ff

wrangler d1 create ev-garage
# записать database_id в wrangler.jsonc → d1_databases binding DB

wrangler d1 execute ev-garage --remote --file=migrations/0001_schema.sql
wrangler d1 execute ev-garage --remote --file=migrations/0002_seed_from_cars.sql

wrangler d1 execute ev-garage --remote --command="SELECT COUNT(*) AS brands FROM brands; SELECT COUNT(*) AS models FROM models; SELECT COUNT(*) AS trims FROM trims;"
```

Ожидаемо: ~20 brands, ~56 models (как в cars.ts на момент экспорта).

## Файлы в репо

- `migrations/0001_schema.sql` — схема
- `scripts/dump-brands.ts` + `scripts/export-cars-to-sql.mjs` — пересборка seed из cars.ts
