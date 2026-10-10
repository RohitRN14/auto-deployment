# ─────────────────────────────────────────────────────────────────────────────
# Backend Dockerfile – multi-stage, production-optimised
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: dependency install ───────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Copy only package files first for layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# ── Stage 2: production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY src/ ./src/
COPY package.json ./

# Set ownership
RUN chown -R appuser:appgroup /app
USER appuser

# Expose the API port
EXPOSE 5000

# Health check (Docker will mark container unhealthy if this fails)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Start the server
CMD ["node", "src/server.js"]
