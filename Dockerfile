# CIASO website – production image (Next.js standalone + SQLite on a volume)
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG SITE_URL=https://ciaso.ca
ENV NEXT_TELEMETRY_DISABLED=1 SITE_URL=$SITE_URL
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/app/data/ciaso.db
RUN addgroup -S app && adduser -S app -G app && mkdir -p /app/data && chown app:app /app/data
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/db ./db
COPY --from=build /app/scripts ./scripts
USER app
VOLUME ["/app/data"]
EXPOSE 3000
# Create tables, load initial content and the first admin (only when empty), then start.
CMD ["sh", "-c", "node scripts/setup-db.mjs && node server.js"]
