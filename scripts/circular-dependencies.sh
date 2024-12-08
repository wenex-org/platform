# Gateway
npm run dpdm:ts ./apps/gateway/src/main.ts -- --progress > circular-dependencies.txt

# Services
npm run dpdm:ts ./apps/services/auth/src/main.ts -- --progress >> circular-dependencies.txt

# Workers
npm run dpdm:ts ./apps/workers/watcher/src/main.ts -- --progress >> circular-dependencies.txt

# Madge
npm run madge:report:ts
