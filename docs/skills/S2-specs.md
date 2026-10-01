# S2 — Характеристики (спеки)

## Цель
Единый формат технических характеристик для карточек и сравнения.

## Обязательные поля версии (Trim)
- `powertrainType`: BEV | EREV | HEV | PHEV
- `rangeKm` — электроход CLTC
- `totalRangeKm` — общий (для BEV = rangeKm)
- `powerHp`, `powerKw`, `torqueNm`
- `accelSec`, `topSpeedKmh`
- `batteryKwh`, `batteryType`, `fastCharge`
- `drive` — Передний / Задний / Полный
- `lidar` — строка или отсутствие (явно «нет / н/д»)

## Опционально
- `priceCny`, `motorModel`, `powerP30Kw`, ICE-мощность для EREV
- габариты: length/width/height/wheelbase, массы, радиус разворота
- `highlight` — короткое отличие версии

## Порядок показа
Как в `fullSpecRows` (`src/data/cars.ts`): кузов и места → привод → запас хода → тип двигателя → мощность → динамика → батарея → зарядка → LiDAR → габариты.

## Чеклист «готово»
- [ ] LiDAR не пропущен (есть / нет / неизвестно)
- [ ] BEV/EREV/PHEV согласован с range vs totalRange
- [ ] единицы: км, кВт, л.с., кВт·ч, с
