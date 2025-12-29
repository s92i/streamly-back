FROM node:20.17.0-slim AS base
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --include-optional

FROM base AS build
COPY . .
RUN yarn prisma generate
RUN yarn build

FROM node:20.17.0-slim AS production
WORKDIR /app

COPY --from=build /app/package.json /app/yarn.lock ./
RUN yarn install --production --frozen-lockfile --include-optional

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma/generated ./prisma/generated

CMD ["node", "dist/main"]
