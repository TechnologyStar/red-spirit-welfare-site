#!/bin/bash

echo "🚀 Starting Red Spirit Welfare Site..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Initialize database
echo "🗄️ Initializing database..."
npm run init-db

# Build backend
echo "🔨 Building backend..."
npm run build

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Start backend server
echo "🌟 Starting server..."
cd ../backend
npm start
