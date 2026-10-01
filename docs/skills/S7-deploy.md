# S7 — Деплой Cloudflare

## Цель
Собрать OpenNext и выложить Worker `ev-garage`.

## Как устроено
- Скрипт: `npm run deploy` → `opennextjs-cloudflare build && deploy`
- CI: `.github/workflows/deploy-cloudflare.yml`
- Ручной запуск: Actions → Deploy to Cloudflare Workers → Run workflow (можно вставить API token в input)
- URL: https://ev-garage.olegsh247.workers.dev

## Проверка после деплоя
1. Главная 200
2. `/api/brands` или `/api/catalog` — JSON, ~20 брендов
3. `/brand/zeekr` 200
4. `/compare` 200
5. CSS/JS хеши обновились (не залипший старый билд)

## Не делает
- Коммит секретов в git
- Перезапись worker тестовым noop без отката

## Чеклист «готово»
- [ ] Actions зелёный или локальный deploy успешен
- [ ] API каталога не 404
- [ ] Владельцу сказано простым языком: «можно открывать»
