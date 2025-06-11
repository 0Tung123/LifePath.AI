#!/bin/bash
echo "Starting the backend (port 3000)..."
cd backend && npm run start:dev &

echo "Starting the frontend (port 3002)..."
cd frontend && npm run dev &

echo "Both services are starting..."
echo "- Backend URL: http://localhost:3000"
echo "- Frontend URL: http://localhost:3002"