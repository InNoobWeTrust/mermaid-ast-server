ARG BUILD_IMAGE=node:20-slim
ARG RUN_IMAGE=gcr.io/distroless/nodejs24-debian12:debug

FROM ${BUILD_IMAGE} AS builder
WORKDIR /app
RUN corepack enable

COPY package.json ./package.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack pnpm install --production

FROM ${RUN_IMAGE} AS runner

LABEL name="Mermaid AST server"
LABEL description="Nodejs server to parse mermaid diagram into AST and return json"

WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY index.js /app/
COPY src /app/src

ARG PORT=5000
ENV PORT=${PORT}

EXPOSE ${PORT}
CMD [ "index.js" ]
