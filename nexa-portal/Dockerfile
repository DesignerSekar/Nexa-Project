# Stage 1 – build
#
# pnpm workspace equivalent of the legacy npm Dockerfile. The manifests are copied before the
# sources so a change to application code does not invalidate the dependency layer.
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/nexa-portal/package.json ./apps/nexa-portal/
COPY libs/core/auth/package.json ./libs/core/auth/
COPY libs/core/contract/package.json ./libs/core/contract/
COPY libs/core/data/package.json ./libs/core/data/
COPY libs/core/schemas/package.json ./libs/core/schemas/
COPY libs/core/tokens/package.json ./libs/core/tokens/
COPY libs/core/util/package.json ./libs/core/util/
COPY libs/web/platform/package.json ./libs/web/platform/
COPY libs/web/theme/package.json ./libs/web/theme/
COPY libs/web/ui/package.json ./libs/web/ui/

# `--ignore-scripts` skips the husky `prepare` hook, which needs a git repo that is not in the
# image. `--frozen-lockfile` makes a stale lockfile fail the build instead of silently resolving
# different versions than CI tested.
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

# VITE_API_URL is intentionally empty so all /api/* calls go to same origin
RUN pnpm --filter @nexa/nexa-portal exec vite build

# Stage 2 – serve
FROM nginx:1.27-alpine
COPY --from=builder /app/apps/nexa-portal/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
