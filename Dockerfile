# App Image
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

# Service Image
FROM build

COPY . .

ARG COMMAND
ARG APP_NAME

ENV SERVICE_NAME=${APP_NAME}
ENV OTLP_SERVICE_NAME=${APP_NAME}

CMD npm run start ${COMMAND}
