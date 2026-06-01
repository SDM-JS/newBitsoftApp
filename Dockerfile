FROM node:22-alpine

WORKDIR /app

# Enable pnpm via corepack (matches packageManager field in package.json)
RUN corepack enable

# Install dependencies first for better layer caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Generate the Prisma client before copying the rest of the source.
# This is the step missing on Render that causes the PrismaClient import error.
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN pnpm prisma generate

# Copy application source
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
