# =========================
# BUILD STAGE
# =========================
FROM node:24-alpine AS builder

WORKDIR /app

# Copiar package para aprovechar cache
COPY package*.json ./

# Instalar todas las dependencias
RUN npm ci

# Copiar código
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build


# =========================
# PRODUCTION STAGE
# =========================
FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copiar package
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev --ignore-scripts

# Copiar build
COPY --from=builder /app/dist ./dist

# Prisma Client is emitted into dist/generated/prisma by `npm run build`.

EXPOSE 3000

CMD ["node", "dist/main.js"]
