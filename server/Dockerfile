# Lightweight Node LTS image
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source
COPY --chown=node:node . .

# Uploads dir must be writable by the non-root user
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-5000}/health || exit 1

CMD ["node", "index.js"]
