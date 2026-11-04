# Build stage: compile TypeScript to dist/
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage: production deps, compiled code and SQL migrations
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY drizzle ./drizzle
RUN mkdir -p uploads && chown node:node uploads
USER node
EXPOSE 5000
# Migrations run automatically on start.
CMD ["node", "dist/server.js"]
