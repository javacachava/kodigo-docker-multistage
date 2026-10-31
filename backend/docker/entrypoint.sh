#!/bin/sh
# Prepara Laravel con las variables de entorno reales del contenedor y luego
# cede el control (exec) al proceso principal para que reciba las señales.
set -eu

if [ "${1:-}" = "php-fpm" ]; then
    # La caché de configuración se calcula aquí y no en el build: así la misma
    # imagen sirve para cualquier entorno (las credenciales no quedan en capas).
    php artisan config:cache
    php artisan event:cache
    php artisan view:cache

    if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
        php artisan migrate --force
    fi

    # El seeder crea clientes y productos aleatorios: se ejecuta una sola vez,
    # únicamente si la tabla de usuarios está vacía.
    if [ "${RUN_SEEDERS:-false}" = "true" ]; then
        users=$(php artisan tinker --execute='echo "users=" . App\Models\User::count();' | grep -o 'users=[0-9]*' | tail -n 1)
        if [ "$users" = "users=0" ]; then
            php artisan db:seed --force
        fi
    fi

    # El JSON de Swagger depende de APP_URL, por eso también se genera en runtime.
    php artisan l5-swagger:generate
fi

exec "$@"
