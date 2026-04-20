FROM node:24.14.1-bookworm-slim AS base
WORKDIR /app
COPY package.json package-lock.json turbo.json ./
COPY apps/server/package.json ./apps/server/
RUN npm ci

FROM base AS dev
COPY apps/server ./apps/server
WORKDIR /app/apps/server
CMD ["npm", "run", "dev"]

FROM base AS builder
COPY apps/server ./apps/server
WORKDIR /app/apps/server
RUN npm run build

FROM node:24.14.1-bookworm-slim AS prod
WORKDIR /app
COPY package.json package-lock.json turbo.json ./
COPY apps/server/package.json ./apps/server/
RUN npm ci --omit=dev
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY apps/server/drizzle ./apps/server/drizzle
WORKDIR /app/apps/server
EXPOSE 3000
CMD ["node", "dist/main.js"]
