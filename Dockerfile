# Builder
FROM docker.io/imbios/bun-node:1.0-21-alpine AS builder
WORKDIR /build/

COPY . ./

RUN bun install --production --frozen-lockfile
RUN bun run build:standalone

# Runner
FROM gcr.io/distroless/base-nossl-debian12:nonroot AS runner
USER 65532:65532

COPY --chown=65532:65532 --from=builder /build/dist/jspaste ./

LABEL org.opencontainers.image.url="https://jspaste.eu"
LABEL org.opencontainers.image.source="https://github.com/jspaste/backend"
LABEL org.opencontainers.image.title="JSP-Backend"
LABEL org.opencontainers.image.description="The backend for JSPaste, built with Bun and ElysiaJS"
LABEL org.opencontainers.image.documentation="https://docs.jspaste.eu"
LABEL org.opencontainers.image.licenses="EUPL-1.2"

VOLUME /home/nonroot/documents
EXPOSE 4000/tcp

CMD ["./jspaste"]