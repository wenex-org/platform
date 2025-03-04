FROM node:22-alpine AS build

WORKDIR /app

RUN apk update && apk add bash

COPY . .

RUN npm install -g pnpm@10.5.2 && \
  pnpm install --frozen-lockfile

RUN npm run script:build

FROM build

ARG SERVICE_NAME

ENV OTLP_SERVICE_NAME=${SERVICE_NAME}
ENV ELASTIC_APM_SERVICE_NAME=${SERVICE_NAME}

CMD npm run script:start ${SERVICE_NAME}
