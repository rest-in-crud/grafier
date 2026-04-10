FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
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

FROM node:20-alpine AS prod
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/
RUN npm ci --omit=dev
COPY --from=builder /app/apps/server/dist ./apps/server/dist
WORKDIR /app/apps/server
EXPOSE 3000
CMD ["node", "dist/main.js"]
