# ---- Etapa 1: build ----
FROM node:20-slim AS build
WORKDIR /app

# Dependencias del sistema para compilar better-sqlite3 (módulo nativo)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Etapa 2: runtime ----
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
ENV DATA_DIR=/app/data

# Copia el servidor compilado y las dependencias (incluye el binario nativo de sqlite)
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Directorio de datos persistente (montar como volumen en Coolify)
RUN mkdir -p /app/data/uploads

EXPOSE 4321

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4321/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "./dist/server/entry.mjs"]
