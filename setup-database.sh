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
DB_USER="ayur_user"
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
echo "Enter database password for user '$DB_USER' (leave empty for no password):"
DB_PASSWORD=$(read_password "Password")

echo ""
echo "Enter PostgreSQL superuser password (for user '$POSTGRES_USER'):"
POSTGRES_PASSWORD=$(read_password "Superuser password")

echo ""
echo "🔧 Setting up database..."

# Create database and user
echo "Creating database and user..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -U "$POSTGRES_USER" -h localhost << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database and user created successfully"
else
    echo "❌ Failed to create database and user"
    exit 1
fi

# Initialize schema
echo "Initializing database schema..."
PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -d "$DB_NAME" -f database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema initialized"
else
    echo "❌ Failed to initialize schema"
    exit 1
fi

# Load seed data
echo "Loading seed data..."
PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -d "$DB_NAME" -f database/seed.sql

if [ $? -eq 0 ]; then
    echo "✅ Seed data loaded"
else
    echo "❌ Failed to load seed data"
    exit 1
fi

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update your backend/.env file with these credentials:"
echo "   DB_HOST=localhost"
echo "   DB_PORT=5432"
echo "   DB_NAME=$DB_NAME"
echo "   DB_USER=$DB_USER"
echo "   DB_PASSWORD=$DB_PASSWORD"
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
