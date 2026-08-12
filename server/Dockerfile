# Use lightweight Node LTS image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency files first (for efficient layer caching)
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose server port (from your .env file)
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]