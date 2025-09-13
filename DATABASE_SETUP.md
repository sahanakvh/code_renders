# Database Setup Guide

This guide will help you set up PostgreSQL for the Ayur Flow Sutra application.

## Prerequisites

1. **PostgreSQL Installation**
   ```bash
   # macOS (using Homebrew)
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   
   # Windows
   # Download and install from https://www.postgresql.org/download/
   ```

2. **Create Database User (Optional)**
   ```bash
   # Connect to PostgreSQL as superuser
   psql -U postgres
   
   # Create a new user for the application
   CREATE USER ayur_user WITH PASSWORD 'your_secure_password';
   ALTER USER ayur_user CREATEDB;
   
   # Exit psql
   \q
   ```

## Configuration

1. **Environment Variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your PostgreSQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ayur_flow_sutra
   DB_USER=postgres  # or ayur_user if you created a specific user
   DB_PASSWORD=your_password_here
   
   NODE_ENV=development
   PORT=3000
   ```

2. **Database Setup**
   
   Run the setup script to create the database and populate it with sample data:
   ```bash
   npm run db:setup
   ```
   
   This script will:
   - Create the `ayur_flow_sutra` database
   - Set up all required tables and relationships
   - Insert sample data for testing
   - Verify the setup

## Database Schema

The application uses the following main tables:

- **users** - Base user information (patients, therapists, admins)
- **patients** - Patient-specific information
- **therapists** - Therapist profiles and availability
- **therapy_definitions** - Available therapy types
- **rooms** - Treatment room information
- **booking_requests** - Patient booking requests
- **therapy_sessions** - Actual therapy appointments
- **mental_health_assessments** - Patient wellness tracking
- **notifications** - User notifications

## Usage

Once the database is set up:

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **The application will automatically**:
   - Connect to PostgreSQL on startup
   - Use real database data instead of mock data
   - Provide full CRUD operations

## Troubleshooting

### Connection Issues

1. **PostgreSQL not running**:
   ```bash
   # Check if PostgreSQL is running
   pg_ctl status
   
   # Start PostgreSQL
   brew services start postgresql  # macOS
   sudo systemctl start postgresql  # Linux
   ```

2. **Authentication failed**:
   - Check your credentials in `.env`
   - Ensure the user exists and has proper permissions
   - Try connecting manually: `psql -h localhost -U your_user -d ayur_flow_sutra`

3. **Database doesn't exist**:
   - Run `npm run db:setup` to create it
   - Or create manually: `createdb ayur_flow_sutra`

4. **Permission denied**:
   - Ensure your user has `CREATEDB` privileges
   - Or run setup as postgres superuser

### Reset Database

To reset the database with fresh data:
```bash
npm run db:reset
```

This will drop all tables and recreate them with sample data.

## Development vs Production

### Development
- Uses sample data for testing
- Database auto-creates on first run
- All features available with mock patients/therapists

### Production
- Remove sample data after setup
- Use environment-specific credentials
- Set up proper backup procedures
- Configure connection pooling for scale

## Data Migration

To migrate from mock data to PostgreSQL:

1. Export any custom data you've created
2. Run the database setup
3. Manually import your custom data
4. Update any hardcoded mock IDs in your frontend

## Security Notes

- Never commit `.env` file to version control
- Use strong passwords for database users
- Limit database user permissions to minimum required
- Enable SSL in production environments
- Regular backup procedures

## Sample Data

The setup includes sample data:
- 5 patients with various conditions
- 4 therapists with different specializations
- 6 therapy types (Abhyanga, Shirodhara, etc.)
- 5 treatment rooms
- Sample bookings and sessions
- Mental health assessments
- Notifications

This allows you to immediately test all features without creating data manually.
