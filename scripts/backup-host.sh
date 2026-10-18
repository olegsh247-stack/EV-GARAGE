#!/bin/sh
# Резервная копия сайта на сервере: база Postgres + папка с фото.
# Запуск вручную:   sh scripts/backup-host.sh
# Раз в сутки (cron, от пользователя, который запускает docker), например в 03:30:
#   30 3 * * * cd /opt/ev-garage && sh scripts/backup-host.sh >> /var/log/ev-garage-backup.log 2>&1
#
# Копии лежат в BACKUP_DIR (по умолчанию /opt/ev-garage-backups) и хранятся KEEP_DAYS дней.
# ВАЖНО: копии на том же сервере не спасут, если пропадёт сам сервер — периодически
# забирайте папку BACKUP_DIR к себе (scp / rsync) или на другое хранилище.
set -eu
cd "$(dirname "$0")/.."

BACKUP_DIR="${BACKUP_DIR:-/opt/ev-garage-backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"
umask 077

echo "[$STAMP] база данных..."
docker compose --profile full exec -T postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' \
  | gzip > "$BACKUP_DIR/db-$STAMP.sql.gz"

echo "[$STAMP] фотографии..."
docker compose --profile full exec -T app tar -C /data -cf - photos \
  | gzip > "$BACKUP_DIR/photos-$STAMP.tar.gz"

# Пустой или почти пустой файл — признак сбоя: не оставляем его и сообщаем об ошибке.
for f in "$BACKUP_DIR/db-$STAMP.sql.gz" "$BACKUP_DIR/photos-$STAMP.tar.gz"; do
  if [ ! -s "$f" ] || [ "$(wc -c < "$f")" -lt 100 ]; then
    echo "Ошибка: файл $f пустой" >&2
    rm -f "$f"
    exit 1
  fi
done

find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'db-*.sql.gz' -o -name 'photos-*.tar.gz' \) \
  -mtime +"$KEEP_DAYS" -delete

echo "[$STAMP] готово: $BACKUP_DIR"
ls -lh "$BACKUP_DIR" | tail -n 6
