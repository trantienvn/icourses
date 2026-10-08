FROM node:22.23.1-bookworm-slim AS build
WORKDIR /workspace
COPY package.json ./
COPY package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
RUN npm ci --workspace @classroom/web --workspace @classroom/shared
COPY packages/shared packages/shared
COPY apps/web apps/web
RUN npm run build --workspace @classroom/web

FROM nginx:1.29-alpine
COPY docker/web.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/web/dist/classroom-web /usr/share/nginx/html
EXPOSE 8080
