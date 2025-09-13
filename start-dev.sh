#!/bin/bash

# Ayur Flow Sutra - Quick Start Script
# This script starts both frontend and backend in development mode

echo "🚀 Starting Ayur Flow Sutra Development Environment"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found!"
    echo "Please copy backend/.env.example to backend/.env and configure your database settings"
    exit 1
fi

echo "✅ All checks passed!"
echo ""
echo "🔧 Starting services..."

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🔄 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🔄 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Development environment started!"
echo ""
echo "📍 Access your application:"
echo "   Frontend: http://localhost:8081"
echo "   Backend:  http://localhost:3003"
echo ""
echo "🔐 Demo accounts (password: password123):"
echo "   Patient:   patient@demo.com"
echo "   Therapist: therapist@demo.com"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for background processes
wait
