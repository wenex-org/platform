# Gateway
npm run dpdm:ts ./apps/gateway/src/main.ts -- --progress > circular-dependencies.txt

# Commands
npm run dpdm:ts ./libs/command/src/main.ts -- --progress >> circular-dependencies.txt

# Services
npm run dpdm:ts ./apps/services/auth/src/main.ts -- --progress >> circular-dependencies.txt
npm run dpdm:ts ./apps/services/context/src/main.ts -- --progress >> circular-dependencies.txt
npm run dpdm:ts ./apps/services/domain/src/main.ts -- --progress >> circular-dependencies.txt
npm run dpdm:ts ./apps/services/essential/src/main.ts -- --progress >> circular-dependencies.txt
npm run dpdm:ts ./apps/services/identity/src/main.ts -- --progress >> circular-dependencies.txt
npm run dpdm:ts ./apps/services/special/src/main.ts -- --progress >> circular-dependencies.txt

# Workers
npm run dpdm:ts ./apps/workers/dispatcher/src/main.ts -- --progress >> circular-dependencies.txt
npm run dpdm:ts ./apps/workers/observer/src/main.ts -- --progress >> circular-dependencies.txt
npm run dpdm:ts ./apps/workers/preserver/src/main.ts -- --progress >> circular-dependencies.txt
npm run dpdm:ts ./apps/workers/watcher/src/main.ts -- --progress >> circular-dependencies.txt

# Madge
npm run madge:report:ts
