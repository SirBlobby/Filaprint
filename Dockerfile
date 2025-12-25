# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1 AS production

WORKDIR /app

# Copy package files for production dependencies
COPY package.json bun.lock* ./

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# Copy built application from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/server ./server

# Create uploads directory for 3D models
RUN mkdir -p /app/static/uploads/models

# Copy static files
COPY --from=builder /app/static ./static

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"]
