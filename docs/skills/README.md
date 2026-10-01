# Скиллы EV-GARAGE

Скилл = зона ответственности агента. Промпты лежат в `docs/prompts/`.

| Код | Файл | Назначение |
|-----|------|------------|
| S1 | [S1-catalog.md](./S1-catalog.md) | Бренды, модели, версии |
| S2 | [S2-specs.md](./S2-specs.md) | Характеристики, LiDAR, типы силовых установок |
| S3 | [S3-pricing.md](./S3-pricing.md) | CNY → ₽, таможня, логистика |
| S4 | [S4-photos.md](./S4-photos.md) | Галереи, порядок, KV |
| S5 | [S5-ux.md](./S5-ux.md) | UI, мобилка, сравнение |
| S6 | [S6-d1.md](./S6-d1.md) | D1, схема, сид, fallback |
| S7 | [S7-deploy.md](./S7-deploy.md) | OpenNext → Cloudflare Workers |
| S8 | [S8-monitoring.md](./S8-monitoring.md) | Мониторинг новинок Китая |
| S9 | [S9-suggestions.md](./S9-suggestions.md) | Новинка → suggestions / каталог |
| S10 | [S10-access.md](./S10-access.md) | Доступы GitHub / Cloudflare |

**Ограничения проекта (всегда):** без R2; фото в KV (`PHOTOS_KV`); каталог читается из D1 с fallback на `src/data/cars.ts`; владелец не технарь — ответы простые; прод не ломать без явного «делай».

**Живой сайт:** https://ev-garage.olegsh247.workers.dev  
**Репозиторий:** https://github.com/olegsh247-stack/EV-GARAGE
