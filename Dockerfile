FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy backend source
COPY backend/ ./backend/

# Build backend
RUN npm run build

# Copy frontend package files
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

# Copy frontend source
COPY frontend/ ./frontend/

# Build frontend
RUN npm run build

# Go back to backend directory
WORKDIR /app/backend

# Initialize database
RUN npm run init-db

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]
