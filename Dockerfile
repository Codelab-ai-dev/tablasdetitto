# ---- Etapa 1: build del sitio estático ----
FROM node:20-alpine AS build
WORKDIR /app

# Instala dependencias con caché eficiente
COPY package.json package-lock.json ./
RUN npm ci

# Copia el resto y genera dist/
COPY . .
RUN npm run build

# ---- Etapa 2: servir con nginx ----
FROM nginx:1.27-alpine AS runtime

# Config de nginx para sitio estático
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia el sitio compilado
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Healthcheck simple para que Coolify sepa que el contenedor está sano
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
