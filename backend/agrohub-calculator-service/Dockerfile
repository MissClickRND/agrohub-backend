FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY docker.env .env

COPY . .

RUN npm run build

# production stage
FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

COPY docker.env .env
COPY docker-entrypoint.sh docker-entrypoint.sh

EXPOSE 4009

CMD ["sh", "docker-entrypoint.sh"]