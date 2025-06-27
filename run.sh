#!/bin/bash

# LifePath.AI Startup Script

# Function to display messages
print_message() {
  echo -e "\033[1;34m$1\033[0m"
}

# Function to display errors
print_error() {
  echo -e "\033[1;31m$1\033[0m"
}

# Function to display success messages
print_success() {
  echo -e "\033[1;32m$1\033[0m"
}

# Check if Docker is running
print_message "Checking if Docker is running..."
if ! docker info > /dev/null 2>&1; then
  print_error "Docker is not running. Please start Docker and try again."
  exit 1
fi
print_success "Docker is running!"

# Start the database and pgAdmin
print_message "Starting PostgreSQL and pgAdmin..."
docker compose up -d db pgadmin
print_success "Database services started!"

# Check if .env files exist, create them if they don't
if [ ! -f "./backend/.env" ]; then
  print_message "Creating backend .env file..."
  cat > ./backend/.env << EOL
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=lifepath

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your_email@example.com
MAIL_PASSWORD=your_email_password
MAIL_FROM=noreply@lifepath.ai

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:3002

# Gemini API Key (for AI integration)
GEMINI_API_KEY=your_gemini_api_key_here
EOL
  print_success "Backend .env file created!"
fi

if [ ! -f "./frontend/.env.local" ]; then
  print_message "Creating frontend .env.local file..."
  cat > ./frontend/.env.local << EOL
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Application Configuration
NEXT_PUBLIC_APP_NAME=LifePath.AI
NEXT_PUBLIC_APP_DESCRIPTION=An immersive text-based adventure game with dynamic world-building

# Server Port (for development)
PORT=3002

# Authentication
NEXT_PUBLIC_AUTH_ENABLED=true

# Feature Flags
NEXT_PUBLIC_ENABLE_REGISTRATION=true
NEXT_PUBLIC_ENABLE_PASSWORD_RESET=true

# Theme Configuration
NEXT_PUBLIC_DEFAULT_THEME=dark
EOL
  print_success "Frontend .env.local file created!"
fi

# Ask user if they want to run backend in Docker or locally
print_message "How would you like to run the backend?"
echo "1. Run in Docker (recommended)"
echo "2. Run locally with npm"
read -p "Enter your choice (1/2): " backend_choice

if [ "$backend_choice" = "1" ]; then
  print_message "Starting backend in Docker..."
  docker compose up -d app
  print_success "Backend started in Docker! Available at http://localhost:3000"
else
  print_message "Starting backend locally..."
  cd backend
  npm run start:dev &
  cd ..
  print_success "Backend started locally! Available at http://localhost:3000"
fi

# Ask user if they want to run frontend in Docker or locally
print_message "How would you like to run the frontend?"
echo "1. Run locally with npm (recommended for development)"
echo "2. Run in Docker"
read -p "Enter your choice (1/2): " frontend_choice

if [ "$frontend_choice" = "2" ]; then
  print_message "Starting frontend in Docker..."
  # Uncomment the frontend service in docker-compose.yml
  sed -i 's/# frontend:/frontend:/g' docker-compose.yml
  sed -i 's/#   build:/  build:/g' docker-compose.yml
  sed -i 's/#     context:/    context:/g' docker-compose.yml
  sed -i 's/#     dockerfile:/    dockerfile:/g' docker-compose.yml
  sed -i 's/#   container_name:/  container_name:/g' docker-compose.yml
  sed -i 's/#   restart:/  restart:/g' docker-compose.yml
  sed -i 's/#   ports:/  ports:/g' docker-compose.yml
  sed -i 's/#     - "3002:3002"/    - "3002:3002"/g' docker-compose.yml
  sed -i 's/#   environment:/  environment:/g' docker-compose.yml
  sed -i 's/#     - NEXT_PUBLIC_API_URL=/    - NEXT_PUBLIC_API_URL=/g' docker-compose.yml
  sed -i 's/#     - PORT=/    - PORT=/g' docker-compose.yml
  sed -i 's/#   volumes:/  volumes:/g' docker-compose.yml
  sed -i 's/#     - .\/frontend:\/app/    - .\/frontend:\/app/g' docker-compose.yml
  sed -i 's/#     - \/app\/node_modules/    - \/app\/node_modules/g' docker-compose.yml
  
  docker compose up -d frontend
  print_success "Frontend started in Docker! Available at http://localhost:3002"
else
  print_message "Starting frontend locally..."
  cd frontend
  npm run dev &
  cd ..
  print_success "Frontend started locally! Available at http://localhost:3002"
fi

print_message "LifePath.AI is now running!"
echo "- Frontend: http://localhost:3002"
echo "- Backend API: http://localhost:3000"
echo "- API Documentation: http://localhost:3000/api"
echo "- pgAdmin: http://localhost:5050"
echo "  - Email: admin@lifepath.ai"
echo "  - Password: admin"

print_message "Press Ctrl+C to stop the application"
wait