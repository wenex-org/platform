FROM vhidvz/node:22-base
WORKDIR /app

COPY . .

RUN npm run git:clone
RUN npm install -g pnpm@10.5.2 && \
  pnpm install --frozen-lockfile
RUN npm run script:build

CMD ["bash", "-c", "npm run script:start ${SERVICE_NAME:-gateway}"]
