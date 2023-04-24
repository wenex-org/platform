# App Image
FROM node:18-alpine AS BASE

WORKDIR /app

COPY package-lock.json ./

RUN npm ci

# Service Image
FROM BASE

COPY . .

ARG APP_NAME

ENV PROJECT=${APP_NAME}
ENV OTLP_SERVICE_NAME=${APP_NAME}

EXPOSE 3000 5000

CMD npm run start:dev ${PROJECT}
