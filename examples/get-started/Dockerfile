# Use Node.js base image for WebSocket server
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
RUN npm init -y && \
    npm install ws

# Create WebSocket server file
RUN echo 'const WebSocket = require("ws"); \
    const wss = new WebSocket.Server({ port: 8080 }); \
    console.log("WebSocket server running on port 8080"); \
    wss.on("connection", ws => { \
        console.log("Client connected"); \
        ws.on("message", msg => { \
            console.log("Received:", msg.toString()); \
            ws.send("Server received: " + msg); \
        }); \
    });' > server.js

# Expose port for WebSocket server
EXPOSE 8080

# Start WebSocket server
CMD ["node", "server.js"]