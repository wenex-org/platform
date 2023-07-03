# App Image
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Service Image
FROM build

COPY . .

ARG COMMAND
ARG APP_NAME

ENV SERVICE_NAME=${APP_NAME}
ENV OTLP_SERVICE_NAME=${APP_NAME}

CMD npm run start ${COMMAND}
