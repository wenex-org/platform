FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

FROM build

COPY . .

ARG SERVICE_NAME

ENV OTLP_SERVICE_NAME=${SERVICE_NAME}

CMD npm run start ${SERVICE_NAME}
