# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install libstdc++ which might be needed by tectonic (even static builds sometimes need basic libs)
# Since we are using the musl binary, alpine is correct.
RUN apk add --no-cache libstdc++ fontconfig pandoc

# Copy built node app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy Tectonic binary
# We use the Linux binary for the Docker image
COPY tectonic/bin/tectonic /usr/local/bin/tectonic
COPY template.docx /app/template.docx
RUN chmod +x /usr/local/bin/tectonic

# Create temp directory for PDF generation
RUN mkdir -p /tmp/pdf-gen && chmod 777 /tmp/pdf-gen

EXPOSE 1991

CMD ["node", "dist/server.js"]
