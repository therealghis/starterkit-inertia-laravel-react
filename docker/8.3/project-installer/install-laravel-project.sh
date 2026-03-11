#!/bin/bash

set -e

# Ottieni la directory dello script (anche se lanciato da fuori)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Root operations
docker build -t php-8.3-laravel "$SCRIPT_DIR"

# No-root operations
# Installa i vendor utilizzando il docker appena costruito e il composer.phar già repository, utilizzando l'utente di sistema
docker run --rm -it \
  --user $(id -u):$(id -g) \
  -v "$(pwd)":/app \
  -w /app \
  php-8.3-laravel bash -c "
    php composer.phar install && \
    php artisan key:generate && \
    php composer.phar cghooks add --ignore-lock && \
    php composer.phar cghooks update
  "
