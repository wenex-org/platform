# ####################################################################
# FROM node:22-alpine
# RUN apk update && apk add git curl bash coreutils
#
# docker build -f Dockerfile.base -t wenex/node:22-base .
# docker push wenex/node:22-base
# ####################################################################

FROM wenex/node:22-base
WORKDIR /app

COPY . .

RUN npm run git:clone && \
  npm install -g pnpm@10.5.2 && \
  pnpm install --frozen-lockfile && \
  npm run script:build

CMD ["node", "--stack-size=4096", "scripts/start.js"]
