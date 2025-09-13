#!/bin/bash

# Ayur Flow Sutra - Database Setup Script
# This script automates the database setup process

set -e  # Exit on any error

echo "🚀 Ayur Flow Sutra - Database Setup"
echo "=================================="

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL first:"
    echo "  macOS: brew install postgresql"
    echo "  Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

echo "✅ PostgreSQL found"

# Default values
DB_NAME="ayur_flow_sutra"
DB_USER="sahanak"
DB_PASSWORD=""
POSTGRES_USER="postgres"

# Function to prompt for password
read_password() {
    echo -n "$1: "
    read -s password
    echo
    echo "$password"
}

echo ""
echo "📋 Database Configuration"
echo "------------------------"

# Get database credentials
echo "Using system user '$DB_USER' for database access."
echo "Note: Since we're using your system user, no additional password is typically needed."
echo ""
echo "Enter PostgreSQL superuser password (for user '$POSTGRES_USER'):"
POSTGRES_PASSWORD=$(read_password "Superuser password")

echo ""
echo "🔧 Setting up database..."

# Create database and grant permissions to existing user
echo "Creating database and granting permissions..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -U "$POSTGRES_USER" -h localhost << EOF
-- Drop database if it exists (for clean setup)
DROP DATABASE IF EXISTS $DB_NAME;
-- Create fresh database
CREATE DATABASE $DB_NAME;
-- Grant permissions to system user
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO "$DB_USER";
ALTER USER "$DB_USER" CREATEDB;
\q
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database and permissions configured successfully"
else
    echo "❌ Failed to create database and configure permissions"
    echo "💡 Make sure:"
    echo "   - PostgreSQL is running: brew services start postgresql"
    echo "   - The postgres user exists: createuser -s postgres"
    echo "   - You entered the correct postgres password"
    exit 1
fi

# Initialize schema
echo "Initializing database schema..."
psql -U "$DB_USER" -d "$DB_NAME" -f database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema initialized"
else
    echo "❌ Failed to initialize schema"
    exit 1
fi

# Load seed data with authentication
echo "Loading seed data with authentication..."
psql -U "$DB_USER" -d "$DB_NAME" -f database/seed_with_auth.sql

if [ $? -eq 0 ]; then
    echo "✅ Seed data with authentication loaded"
else
    echo "❌ Failed to load seed data"
    exit 1
fi

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Your backend/.env file should already have these credentials:"
echo "   DB_HOST=localhost"
echo "   DB_PORT=5432"
echo "   DB_NAME=$DB_NAME"
echo "   DB_USER=$DB_USER"
echo "   DB_PASSWORD="
echo ""
echo "2. Install dependencies and start the application:"
echo "   npm install                  # Install frontend deps"
echo "   cd backend && npm install    # Install backend deps"
echo "   npm run dev                  # Start backend"
echo "   cd .. && npm run dev         # Start frontend (in new terminal)"
echo ""
echo "🔐 Demo accounts (password: password123):"
echo "   Patient: patient@demo.com"
echo "   Therapist: therapist@demo.com"
