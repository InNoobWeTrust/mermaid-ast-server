ARG BUILD_IMAGE=node:20-slim
ARG RUN_IMAGE=gcr.io/distroless/nodejs24-debian12:debug

FROM ${BUILD_IMAGE} AS builder
WORKDIR /app
RUN corepack enable

COPY package.json ./package.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY tsconfig.json ./tsconfig.json
COPY vite.config.ts ./vite.config.ts
RUN corepack pnpm install

COPY src /app/src
RUN corepack pnpm build

FROM ${RUN_IMAGE} AS runner

LABEL name="Mermaid AST server"
LABEL description="Nodejs server to parse mermaid diagram into AST and return json"

WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY healthcheck.js /app/healthcheck.js

ARG PORT=5000
ARG ENABLE_CACHE=true
ENV PORT=${PORT}
ENV DEBUG=1
ENV ENABLE_CACHE=${ENABLE_CACHE}

EXPOSE ${PORT}
CMD [ "dist/index.js" ]
