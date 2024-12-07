# Builder Stage
FROM node:21-alpine3.18 as builder

# Set working directory
WORKDIR /app

# Enable Corepack and prepare PNPM
RUN corepack enable && corepack prepare pnpm@latest --activate

# Environment variables
ENV PNPM_HOME=/usr/local/bin

# Copy only necessary files
COPY package*.json *-lock.yaml ./

# Install dependencies and build
RUN apk add --no-cache --virtual .build-deps \
    python3 make g++ git \
    && pnpm install --frozen-lockfile \
    && pnpm run build \
    && apk del .build-deps

# Final Stage
FROM node:21-alpine3.18 as deploy

# Set working directory
WORKDIR /app

# Copy built files and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json /app/*-lock.yaml ./

# Enable Corepack and prepare PNPM
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install production dependencies
RUN pnpm install --production --ignore-scripts \
    && addgroup -g 1001 -S nodejs \
    && adduser -S -u 1001 -G nodejs nodejs \
    && rm -rf /usr/local/share/.cache /root/.npm /root/.node-gyp

# Set user and start command
USER nodejs
CMD ["node", "dist/app.js"]
