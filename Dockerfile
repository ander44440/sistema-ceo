# ceo-api — packaging monorepo (CAP-13 Opção C)
# Root Directory = .
# Backend: server/ | MEP canónico único: app/src/mepCeo (sem cópia)
FROM node:22-bookworm-slim

WORKDIR /app

# Cache de dependências do backend (lockfile)
COPY server/package.json server/package-lock.json ./server/
RUN npm ci --prefix server --omit=dev

# Código runtime: Hono + MEP canónico
COPY server/src ./server/src
COPY app/src/mepCeo ./app/src/mepCeo

ENV NODE_ENV=production
# PORT e CEO_DATA_ROOT=/data vêm do serviço Railway em runtime.
# Não gravar dados de negócio na imagem.

EXPOSE 8787

# Entrypoint efectivo = server/src/index.js
CMD ["node", "server/src/index.js"]
