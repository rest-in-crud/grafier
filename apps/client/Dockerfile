FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/client/package.json ./apps/client/
RUN npm ci

FROM base AS dev
COPY apps/client ./apps/client
WORKDIR /app/apps/client
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM base AS builder
COPY apps/client ./apps/client
WORKDIR /app/apps/client
RUN npm run build

FROM nginx:alpine AS prod
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
