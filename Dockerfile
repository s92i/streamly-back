FROM node:20.17.0-slim AS base
WORKDIR /app

RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --include-optional

FROM base AS build
COPY . .
RUN yarn prisma generate
RUN yarn build

FROM node:20.17.0-slim AS production
WORKDIR /app

RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev && \
    rm -rf /var/lib/apt/lists/*

COPY --from=build /app/package.json /app/yarn.lock ./
RUN yarn install --production --frozen-lockfile --include-optional

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma/generated ./prisma/generated

EXPOSE 4000

CMD ["node", "dist/main"]
