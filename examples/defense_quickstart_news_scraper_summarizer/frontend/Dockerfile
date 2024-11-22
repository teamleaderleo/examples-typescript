FROM node:20-alpine

# Install required system libraries
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY package*.json ./
RUN pnpm install

COPY . .
RUN pnpm run build

EXPOSE 3000
CMD ["npm", "start"]