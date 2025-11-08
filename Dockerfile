FROM oven/bun:alpine
WORKDIR /app
 
COPY package.json bun.lock ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/
 
COPY . .
RUN bun install
 
RUN bun run build:server
 
CMD ["bun", "run", "start:server"]