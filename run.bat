@echo off
setlocal enabledelayedexpansion

:: LifePath.AI Startup Script for Windows

:: Function to display messages
:print_message
echo [34m%~1[0m
exit /b 0

:: Function to display errors
:print_error
echo [31m%~1[0m
exit /b 0

:: Function to display success messages
:print_success
echo [32m%~1[0m
exit /b 0

:: Check if Docker is running
call :print_message "Checking if Docker is running..."
docker info > nul 2>&1
if %ERRORLEVEL% neq 0 (
  call :print_error "Docker is not running. Please start Docker and try again."
  exit /b 1
)
call :print_success "Docker is running!"

:: Start the database and pgAdmin
call :print_message "Starting PostgreSQL and pgAdmin..."
docker compose up -d db pgadmin
call :print_success "Database services started!"

:: Check if .env files exist, create them if they don't
if not exist ".\backend\.env" (
  call :print_message "Creating backend .env file..."
  (
    echo # Server Configuration
    echo PORT=3000
    echo NODE_ENV=development
    echo.
    echo # Database Configuration
    echo DB_HOST=localhost
    echo DB_PORT=5432
    echo DB_USERNAME=postgres
    echo DB_PASSWORD=postgres
    echo DB_NAME=lifepath
    echo.
    echo # JWT Configuration
    echo JWT_SECRET=your_jwt_secret_key_here
    echo JWT_EXPIRES_IN=1d
    echo JWT_REFRESH_SECRET=your_refresh_token_secret_here
    echo JWT_REFRESH_EXPIRES_IN=7d
    echo.
    echo # Email Configuration
    echo MAIL_HOST=smtp.example.com
    echo MAIL_PORT=587
    echo MAIL_USER=your_email@example.com
    echo MAIL_PASSWORD=your_email_password
    echo MAIL_FROM=noreply@lifepath.ai
    echo.
    echo # Frontend URL (for CORS and email links)
    echo FRONTEND_URL=http://localhost:3002
    echo.
    echo # Gemini API Key (for AI integration)
    echo GEMINI_API_KEY=your_gemini_api_key_here
  ) > .\backend\.env
  call :print_success "Backend .env file created!"
)

if not exist ".\frontend\.env.local" (
  call :print_message "Creating frontend .env.local file..."
  (
    echo # API Configuration
    echo NEXT_PUBLIC_API_URL=http://localhost:3000
    echo.
    echo # Application Configuration
    echo NEXT_PUBLIC_APP_NAME=LifePath.AI
    echo NEXT_PUBLIC_APP_DESCRIPTION=An immersive text-based adventure game with dynamic world-building
    echo.
    echo # Server Port (for development)
    echo PORT=3002
    echo.
    echo # Authentication
    echo NEXT_PUBLIC_AUTH_ENABLED=true
    echo.
    echo # Feature Flags
    echo NEXT_PUBLIC_ENABLE_REGISTRATION=true
    echo NEXT_PUBLIC_ENABLE_PASSWORD_RESET=true
    echo.
    echo # Theme Configuration
    echo NEXT_PUBLIC_DEFAULT_THEME=dark
  ) > .\frontend\.env.local
  call :print_success "Frontend .env.local file created!"
)

:: Ask user if they want to run backend in Docker or locally
call :print_message "How would you like to run the backend?"
echo 1. Run in Docker (recommended)
echo 2. Run locally with npm
set /p backend_choice="Enter your choice (1/2): "

if "%backend_choice%"=="1" (
  call :print_message "Starting backend in Docker..."
  docker compose up -d app
  call :print_success "Backend started in Docker! Available at http://localhost:3000"
) else (
  call :print_message "Starting backend locally..."
  start cmd /k "cd backend && npm run start:dev"
  call :print_success "Backend started locally! Available at http://localhost:3000"
)

:: Ask user if they want to run frontend in Docker or locally
call :print_message "How would you like to run the frontend?"
echo 1. Run locally with npm (recommended for development)
echo 2. Run in Docker
set /p frontend_choice="Enter your choice (1/2): "

if "%frontend_choice%"=="2" (
  call :print_message "Starting frontend in Docker..."
  :: Uncomment the frontend service in docker-compose.yml
  :: This is a simplified version for Windows - may need manual editing
  call :print_message "Please uncomment the frontend service in docker-compose.yml manually"
  timeout /t 5 > nul
  docker compose up -d frontend
  call :print_success "Frontend started in Docker! Available at http://localhost:3002"
) else (
  call :print_message "Starting frontend locally..."
  start cmd /k "cd frontend && npm run dev"
  call :print_success "Frontend started locally! Available at http://localhost:3002"
)

call :print_message "LifePath.AI is now running!"
echo - Frontend: http://localhost:3002
echo - Backend API: http://localhost:3000
echo - API Documentation: http://localhost:3000/api
echo - pgAdmin: http://localhost:5050
echo   - Email: admin@lifepath.ai
echo   - Password: admin

call :print_message "Press Ctrl+C to stop the application"
pause
exit /b 0