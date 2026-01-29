FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Accept build arguments for Vite environment variables
ARG VITE_API_URL=http://localhost:5000
ARG VITE_SOCKET_URL=http://localhost:5000

# Set environment variables for build time
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

EXPOSE 3000

# Build the app 
RUN npm run build

# Serve the built app
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]