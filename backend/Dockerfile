# syntax=docker/dockerfile:1.7

ARG PHP_VERSION=8.2
ARG NGINX_VERSION=1.28

# ---------------------------------------------------------------------------
# base: PHP-FPM con las extensiones que necesita Laravel. Se comparte entre la
# etapa de Composer y la imagen final, así que se construye (y se cachea) una vez.
#   Ya compiladas en la imagen oficial: mbstring, openssl, tokenizer, xml, ctype, json.
#   Se instalan aquí: pdo_mysql y opcache.
# ---------------------------------------------------------------------------
FROM php:${PHP_VERSION}-fpm-alpine AS base

RUN docker-php-ext-install -j"$(nproc)" pdo_mysql opcache

# ---------------------------------------------------------------------------
# vendor: instala dependencias de Composer sin dev. Composer y unzip viven solo
# en esta etapa y nunca llegan a la imagen final.
# ---------------------------------------------------------------------------
FROM base AS vendor

RUN apk add --no-cache unzip
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /build
ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_CACHE_DIR=/tmp/composer-cache

# Capa de dependencias: solo se invalida si cambian composer.json/composer.lock.
COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/tmp/composer-cache \
    composer install \
        --no-dev --no-interaction --no-progress --prefer-dist \
        --no-scripts --no-autoloader

# El código se copia después para que editarlo no reinstale dependencias.
COPY . .
RUN composer dump-autoload --no-dev --classmap-authoritative --no-interaction

# ---------------------------------------------------------------------------
# web: Nginx sin privilegios como proxy inverso hacia PHP-FPM. Solo recibe el
# directorio public/ (front controller y assets estáticos).
# ---------------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION}-alpine AS web

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY public /var/www/html/public

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:8000/up || exit 1

# ---------------------------------------------------------------------------
# app: imagen final de PHP-FPM (último stage = target por defecto). Del builder
# solo se copia vendor/.
# ---------------------------------------------------------------------------
FROM base AS app

WORKDIR /var/www/html

COPY docker/php.ini /usr/local/etc/php/conf.d/zz-production.ini
COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/entrypoint.sh

COPY --from=vendor --chown=www-data:www-data /build/vendor ./vendor

# Solo el código que la aplicación ejecuta (sin tests, docs ni tooling).
COPY --chown=www-data:www-data artisan composer.json ./
COPY --chown=www-data:www-data app ./app
COPY --chown=www-data:www-data bootstrap ./bootstrap
COPY --chown=www-data:www-data config ./config
COPY --chown=www-data:www-data database ./database
COPY --chown=www-data:www-data public ./public
COPY --chown=www-data:www-data resources ./resources
COPY --chown=www-data:www-data routes ./routes

RUN mkdir -p storage/app storage/api-docs storage/logs \
        storage/framework/cache/data storage/framework/sessions storage/framework/views \
    && php artisan package:discover --ansi \
    && chown -R www-data:www-data storage bootstrap/cache

USER www-data
EXPOSE 9000

HEALTHCHECK --interval=15s --timeout=3s --start-period=30s --retries=3 \
    CMD php -r 'exit(@fsockopen("127.0.0.1", 9000) ? 0 : 1);'

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]
