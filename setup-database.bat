@echo off
setlocal enabledelayedexpansion

REM Ayur Flow Sutra - Database Setup Script for Windows
REM This script automates the database setup process

echo 🚀 Ayur Flow Sutra - Database Setup
echo ==================================

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL first:
    echo   Download from https://www.postgresql.org/download/windows/
    echo   Make sure to add PostgreSQL bin directory to PATH
    pause
    exit /b 1
)

echo ✅ PostgreSQL found

REM Default values
set DB_NAME=ayur_flow_sutra
set DB_USER=ayur_user
set POSTGRES_USER=postgres

echo.
echo 📋 Database Configuration
echo ------------------------

REM Get database password
set /p DB_PASSWORD="Enter database password for user '%DB_USER%' (leave empty for no password): "

REM Get PostgreSQL superuser password
set /p POSTGRES_PASSWORD="Enter PostgreSQL superuser password (for user '%POSTGRES_USER%'): "

echo.
echo 🔧 Setting up database...

REM Create database and user
echo Creating database and user...

REM Create a temporary SQL file
echo CREATE DATABASE %DB_NAME%; > temp_setup.sql
echo CREATE USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%'; >> temp_setup.sql
echo GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%; >> temp_setup.sql
echo ALTER USER %DB_USER% CREATEDB; >> temp_setup.sql

REM Execute the SQL commands
set PGPASSWORD=%POSTGRES_PASSWORD%
psql -U %POSTGRES_USER% -h localhost -f temp_setup.sql

if %errorlevel% equ 0 (
    echo ✅ Database and user created successfully
) else (
    echo ❌ Failed to create database and user
    del temp_setup.sql
    pause
    exit /b 1
)

REM Clean up temporary file
del temp_setup.sql

REM Initialize schema
echo Initializing database schema...
set PGPASSWORD=%DB_PASSWORD%
psql -U %DB_USER% -d %DB_NAME% -f database/schema.sql

if %errorlevel% equ 0 (
    echo ✅ Database schema initialized
) else (
    echo ❌ Failed to initialize schema
    pause
    exit /b 1
)

REM Load seed data with authentication
echo Loading seed data with authentication...
psql -U %DB_USER% -d %DB_NAME% -f database/seed_with_auth.sql

if %errorlevel% equ 0 (
    echo ✅ Seed data with authentication loaded
) else (
    echo ❌ Failed to load seed data
    pause
    exit /b 1
)

echo.
echo 🎉 Database setup completed successfully!
echo.
echo 📝 Next steps:
echo 1. Update your backend\.env file with these credentials:
echo    DB_HOST=localhost
echo    DB_PORT=5432
echo    DB_NAME=%DB_NAME%
echo    DB_USER=%DB_USER%
echo    DB_PASSWORD=%DB_PASSWORD%
echo.
echo 2. Install dependencies and start the application:
echo    npm install                  # Install frontend deps
echo    cd backend ^&^& npm install    # Install backend deps
echo    npm run dev                  # Start backend
echo    cd .. ^&^& npm run dev         # Start frontend (in new terminal)
echo.
echo 🔐 Demo accounts (password: password123):
echo    Patient: patient@demo.com
echo    Therapist: therapist@demo.com

pause
