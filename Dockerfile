# Stage 1: Build the Next.js application
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
FROM base AS dependencies
COPY package.json yarn.lock* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
  else npm ci; \
  fi

# Build the Next.js application
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 2: Run the Next.js application
FROM base AS runner

WORKDIR /app

# Set environment variables for production
ENV NODE_ENV production

# Copy necessary files from the builder stage
# If you're using a custom server, copy it here
# COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port Next.js runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]
