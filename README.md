# Kodigo Store — Ecosistema Docker multi-stage

Entorno de producción contenerizado para una tienda en línea formada por tres servicios que ya se desarrollaron durante el bootcamp:

| Servicio | Código fuente | Tecnología |
|---|---|---|
| Frontend | [`frontend/`](frontend/) | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Backend | [`backend/`](backend/) | API REST Laravel 12 sobre PHP 8.2 (JWT, Stripe en modo simulación, Swagger) |
| Base de datos | imagen oficial | MySQL 8.0 |

El objetivo es que cada imagen sea **ligera, segura y reproducible**: builds multi-stage, caché de capas bien aprovechada, procesos sin privilegios de root y toda la orquestación en un único `docker-compose.yml`.

## Arquitectura de contenedores

```text
                     Navegador
                    │         │
             :3000  │         │  :8000   (únicos puertos publicados en el host)
                    ▼         ▼
 ┌───────────────────┐   ┌───────────────────┐
 │ frontend          │   │ nginx             │
 │ Next.js standalone│──▶│ proxy inverso     │
 │ node server.js    │   │ (:8000)           │
 └───────────────────┘   └─────────┬─────────┘
        API_BASE_URL=              │ FastCGI :9000
        http://nginx:8000/api      ▼
                         ┌───────────────────┐        ┌───────────────────┐
                         │ backend           │───────▶│ mysql             │
                         │ PHP-FPM + Laravel │  :3306 │ volumen mysql_data│
                         └───────────────────┘        └───────────────────┘

 red `app`  = frontend · nginx · backend
 red `data` = backend · mysql      (MySQL no es alcanzable desde frontend ni nginx)
```

- **Dos redes aisladas.** Solo el backend pertenece a ambas; `mysql` queda fuera del alcance del frontend y de Nginx.
- **MySQL no publica puertos.** El puerto 3306 existe únicamente dentro de la red `data`.
- **El frontend llama a la API desde el servidor** (Server Components y Server Actions), por eso usa el nombre interno `nginx`. El navegador nunca habla con la API directamente y el JWT vive en una cookie `httpOnly`.
- **Orden de arranque** garantizado con healthchecks: `mysql` → `backend` → `nginx` → `frontend`.

## Estructura del repositorio

```text
.
├── docker-compose.yml          # Orquestación de los 4 contenedores
├── .env.example                # Variables documentadas (copiar a .env)
├── docker/mysql/init/          # Script SQL opcional → /docker-entrypoint-initdb.d/
├── frontend/                   # Código Next.js + Dockerfile + .dockerignore
└── backend/                    # Código Laravel + Dockerfile (targets app y web)
    └── docker/                 # entrypoint.sh, nginx.conf, php.ini
```

## Ejecutar el ecosistema

Requisitos: Docker Engine con Docker Compose v2 (`docker compose`).

```bash
cp .env.example .env
docker compose up --build
```

Ese único comando construye las imágenes, levanta MySQL, aplica las migraciones, carga los datos de demostración la primera vez y arranca la API y el frontend. Agrega `-d` para dejarlo en segundo plano.

| Qué | URL |
|---|---|
| Tienda (frontend) | <http://localhost:3000> |
| API | <http://localhost:8000/api> |
| Swagger UI | <http://localhost:8000/api/documentation> |

Cuentas de demostración (se crean con `RUN_SEEDERS=true`):

| Rol | Correo | Clave |
|---|---|---|
| Cliente | `cliente@example.com` | `Password123` |
| Administrador | `admin@example.com` | `Password123` |

> Los valores de `.env.example` (contraseñas, `APP_KEY`, `JWT_SECRET`) son solo para demostración. Para generar los propios:
>
> ```bash
> sed -i "s|^APP_KEY=.*|APP_KEY=base64:$(openssl rand -base64 32)|" .env
> sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" .env
> ```
>
> Si cambias `MYSQL_*` después del primer arranque, MySQL conserva las credenciales antiguas guardadas en el volumen; ejecuta `docker compose down -v` para empezar de cero.

### Comandos útiles

```bash
docker compose ps                         # estado y salud de los servicios
docker compose logs -f backend            # logs de Laravel (salen por stderr)
docker compose exec mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"'
docker compose exec backend php artisan migrate:status
docker compose down                       # detiene y conserva los datos
docker compose down -v                    # detiene y BORRA el volumen mysql_data
```

## Variables de entorno

Todas se definen en `.env` (plantilla documentada en [`.env.example`](.env.example)).

| Variable | Para qué sirve |
|---|---|
| `FRONTEND_PORT`, `API_PORT` | Puertos publicados en el host (3000 y 8000 por defecto). |
| `MYSQL_VERSION` | Tag de la imagen oficial (`8.0` por defecto). |
| `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` | Configuración de MySQL; el backend usa la misma base y usuario. |
| `APP_KEY`, `JWT_SECRET` | Secretos de Laravel y de firma de JWT. Sin ellos Compose se niega a arrancar. |
| `APP_URL` | URL pública de la API, usada en el JSON de Swagger. |
| `RUN_MIGRATIONS` | Ejecuta `migrate --force` al iniciar el backend. |
| `RUN_SEEDERS` | Carga datos de demostración solo si no hay usuarios. Desactivar en entornos reales. |
| `STRIPE_*` | Claves de Stripe; con los valores de marcador la API simula los pagos. |

## Decisiones técnicas por Dockerfile

### Frontend — [`frontend/Dockerfile`](frontend/Dockerfile)

Tres etapas sobre `node:20-alpine`:

1. **`deps`**: copia solo `package.json` y `package-lock.json` y corre `npm ci`. Mientras no cambien las dependencias, esta capa se reutiliza completa. Usa un *cache mount* para el caché de npm, que no queda en la imagen.
2. **`builder`**: copia el código y ejecuta `next build`. `next.config.ts` activa `output: "standalone"`, así que Next.js produce un servidor mínimo con únicamente los módulos que la app necesita en runtime.
3. **`runner`**: copia `.next/standalone`, `.next/static` y `public/`. No contiene código fuente, `devDependencies`, TypeScript ni caché de npm. Corre `node server.js` con un usuario sin privilegios (`nextjs`, UID 1001), expone el puerto 3000 y define un `HEALTHCHECK`.

`API_BASE_URL` se lee en runtime (no se incrusta en el build), de modo que la misma imagen sirve para cualquier entorno.

### Backend — [`backend/Dockerfile`](backend/Dockerfile)

Cuatro etapas; las dos últimas son los *targets* que usa Compose (`app` y `web`).

1. **`base`**: `php:8.2-fpm-alpine` más `pdo_mysql` y `opcache`. El resto de extensiones que exige la tarea (`mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`) ya vienen compiladas en la imagen oficial; no se reinstalan ni se agregan herramientas de compilación. Se comparte entre `vendor` y `app`, así que se construye una sola vez.
2. **`vendor`**: agrega Composer y `unzip` (solo existen aquí) y ejecuta `composer install --no-dev`. Primero se copian únicamente `composer.json` y `composer.lock`: editar código no reinstala dependencias. Después se copia el código y se genera el autoloader optimizado (`--classmap-authoritative`).
3. **`web`**: `nginx-unprivileged` con la configuración del proxy y solo `public/`. Es el proxy inverso hacia PHP-FPM.
4. **`app`** (target por defecto): imagen final de PHP-FPM. Del builder **se copia únicamente `vendor/`**; el resto es el código que Laravel ejecuta (`app`, `config`, `routes`, `database`, `resources`, `public`, `bootstrap`). No incluye Composer, tests, `.env` ni dependencias de desarrollo. Corre como `www-data`, con `opcache` en modo inmutable y un `HEALTHCHECK` sobre el puerto 9000.

El [`entrypoint.sh`](backend/docker/entrypoint.sh) hace en runtime lo que depende del entorno real y por eso no puede quedar horneado en la imagen: cachea configuración, eventos y vistas, ejecuta migraciones, carga los datos de demostración una sola vez y genera el JSON de Swagger con la `APP_URL` correcta. Después hace `exec` de PHP-FPM para que reciba las señales de Docker.

Nginx y PHP-FPM van en contenedores separados (un proceso por contenedor, sin supervisord). Nginx solo reenvía a `index.php` y responde 404 a cualquier otro `.php`.

### Base de datos — imagen oficial `mysql`

- Configuración exclusivamente por variables de entorno (`MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`).
- Volumen nombrado `mysql_data` montado en `/var/lib/mysql`: los datos sobreviven a `docker compose down`.
- [`docker/mysql/init/01-init.sql`](docker/mysql/init/01-init.sql) se monta en `/docker-entrypoint-initdb.d/` y fija `utf8mb4_unicode_ci` en la base. Solo corre cuando el volumen está vacío.
- Sin `ports`: 3306 nunca se publica en el host.
- `HEALTHCHECK` con `mysqladmin ping`; el backend espera a que esté `healthy`.

### Seguridad aplicada a todo el stack

- Los tres servicios propios corren sin root (`nextjs`, `www-data`, `nginx`).
- `cap_drop: [ALL]` y `no-new-privileges` en frontend, backend y Nginx.
- `.dockerignore` en cada contexto: `.env`, `.git`, `node_modules`, `vendor` y artefactos locales nunca entran en una imagen.
- Ningún secreto está en una capa: todo llega por variables de entorno en runtime. Compose falla con un mensaje claro si falta `APP_KEY`, `JWT_SECRET` o las credenciales de MySQL.
- `server_tokens off` en Nginx, `expose_php = Off` y `display_errors = Off` en PHP.

## Resultados

Tamaños medidos contra un Dockerfile ingenuo de una sola etapa (`COPY . .` + `npm install` o `composer install` con dependencias de desarrollo, sobre la misma imagen base Alpine):

| Imagen | Ingenua (una etapa) | Optimizada (multi-stage) | Reducción |
|---|---:|---:|---:|
| Frontend | 1628 MB | 290 MB | −82 % |
| Backend (PHP-FPM) | 822 MB | 193 MB | −77 % |
| Nginx | — | 81 MB | — |

Caché de capas, comprobado cambiando una línea de código sin tocar las dependencias: en el frontend la capa `npm ci` se reutiliza (solo se recompila la app) y en el backend `composer install` queda `CACHED`; reconstruir el backend tomó unos 14 s.

## Notas

- **PHP 8.2 y `composer.lock`.** El lock original se había resuelto con PHP 8.5 y exigía PHP ≥ 8.4 (Symfony 8), aunque `composer.json` declaraba `^8.2`. Se fijó `config.platform.php = 8.2.0` y se regeneró el lock para que las dependencias sean instalables en `php:8.2-fpm-alpine`. Las 18 pruebas de la API pasan con el lock nuevo.
- **Seeders sin Faker.** Faker es una dependencia de desarrollo y la imagen se instala con `--no-dev`, así que los seeders omiten el relleno aleatorio (5 clientes y 7 productos extra) cuando Faker no existe. Quedan las 2 cuentas y los 13 productos fijos.
- **MySQL 8.0.** Es la versión que pide la tarea, pero su soporte ya terminó. Para usar la LTS vigente basta con `MYSQL_VERSION=8.4` en `.env`.
- **Cookie de sesión `Secure`.** El frontend marca la cookie como `Secure` en producción. Chrome y Firefox la aceptan en `http://localhost`; para otro dominio hay que servir el frontend por HTTPS.
