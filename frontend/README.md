# Frontend — Kodigo Store (Next.js 16)

Frontend App Router con TypeScript y Tailwind CSS v4 que consume la API REST de
`../backend`. Las llamadas a la API se hacen solo desde el servidor (Server
Components y Server Actions) con la variable `API_BASE_URL`; el token JWT vive
en una cookie `httpOnly` y nunca llega al navegador.

Para ejecutarlo junto con la API y MySQL usa el `docker compose` de la raíz del
repositorio (ver el [README principal](../README.md)).

Desarrollo local sin Docker:

```bash
echo "API_BASE_URL=http://localhost:8000/api" > .env.local
npm ci
npm run dev
```
