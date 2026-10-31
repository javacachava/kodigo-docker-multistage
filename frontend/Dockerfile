# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20

# ---------------------------------------------------------------------------
# deps: instala dependencias a partir de los manifests. Esta capa solo se
# invalida cuando cambian package.json / package-lock.json.
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS deps

# Algunos binarios nativos (p. ej. sharp, SWC) esperan glibc; libc6-compat lo cubre en Alpine.
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# ---------------------------------------------------------------------------
# builder: compila la app. Con `output: "standalone"` Next.js genera un
# servidor mínimo con solo las dependencias que realmente se usan en runtime.
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# runner: imagen final. No contiene código fuente, devDependencies ni npm cache.
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

# public/ y .next/static los sirve el propio servidor standalone, pero Next.js
# no los incluye en la carpeta standalone: se copian explícitamente.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:3000/login || exit 1

CMD ["node", "server.js"]
