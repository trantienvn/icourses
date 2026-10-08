FROM node:22.23.1-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace
COPY package.json ./
COPY package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --workspace @classroom/api --workspace @classroom/shared
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npm run db:generate --workspace @classroom/api && npm run build --workspace @classroom/api

FROM node:22.23.1-bookworm-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
WORKDIR /workspace
COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/packages/shared ./packages/shared
COPY --from=build /workspace/apps/api/package.json ./apps/api/package.json
COPY --from=build /workspace/apps/api/dist ./apps/api/dist
COPY --from=build /workspace/apps/api/prisma ./apps/api/prisma
EXPOSE 3000
CMD ["node", "apps/api/dist/server.js"]
