#!/usr/bin/env node

/**
 * Database Setup Script for Ayur Flow Sutra
 * 
 * This script helps you set up the PostgreSQL database for the application.
 * It will create the database, tables, and populate them with sample data.
 * 
 * Prerequisites:
 * - PostgreSQL installed and running
 * - Database user with create database privileges
 * 
 * Usage:
 * npm run db:setup
 */

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: 'postgres' // Connect to postgres database first to create our database
};

const targetDatabase = process.env.DB_NAME || 'ayur_flow_sutra';

async function setupDatabase() {
  console.log('🚀 Setting up Ayur Flow Sutra Database...\n');

  // Connect to PostgreSQL
  const pool = new Pool(config);

  try {
    // Check if database exists
    console.log('📋 Checking if database exists...');
    const dbCheckResult = await pool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDatabase]
    );

    if (dbCheckResult.rows.length === 0) {
      // Create database
      console.log(`📊 Creating database '${targetDatabase}'...`);
      await pool.query(`CREATE DATABASE "${targetDatabase}"`);
      console.log('✅ Database created successfully');
    } else {
      console.log(`📊 Database '${targetDatabase}' already exists`);
    }

    await pool.end();

    // Connect to the target database
    const targetPool = new Pool({
      ...config,
      database: targetDatabase
    });

    // Read and execute schema
    console.log('🔧 Setting up database schema...');
    
    // First, drop all existing tables to ensure clean setup
    console.log('🧹 Cleaning up existing tables...');
    await targetPool.query(`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
    `);
    
    const schemaPath = join(__dirname, '..', 'database', 'schema.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf8');
    await targetPool.query(schemaSQL);
    console.log('✅ Schema created successfully');

    // Read and execute seed data
    console.log('🌱 Populating database with seed data...');
    const seedPath = join(__dirname, '..', 'database', 'seed.sql');
    const seedSQL = readFileSync(seedPath, 'utf8');
    await targetPool.query(seedSQL);
    console.log('✅ Seed data inserted successfully');

    // Verify setup
    console.log('🔍 Verifying database setup...');
    const verifyResults = await Promise.all([
      targetPool.query('SELECT COUNT(*) as count FROM users'),
      targetPool.query('SELECT COUNT(*) as count FROM therapy_definitions'),
      targetPool.query('SELECT COUNT(*) as count FROM rooms'),
      targetPool.query('SELECT COUNT(*) as count FROM booking_requests')
    ]);

    console.log('\n📊 Database Statistics:');
    console.log(`   Users: ${verifyResults[0].rows[0].count}`);
    console.log(`   Therapies: ${verifyResults[1].rows[0].count}`);
    console.log(`   Rooms: ${verifyResults[2].rows[0].count}`);
    console.log(`   Booking Requests: ${verifyResults[3].rows[0].count}`);

    await targetPool.end();

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📖 Next steps:');
    console.log('   1. Update your .env file with the correct database credentials');
    console.log('   2. Run npm run dev to start the application');
    console.log('   3. The application will now use PostgreSQL instead of mock data');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check your database credentials in .env file');
    console.log('   3. Ensure the database user has sufficient privileges');
    process.exit(1);
  }
}

// Run the setup
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  setupDatabase();
}

export default setupDatabase;
