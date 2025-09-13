-- Ayur Flow Sutra Database Schema
-- PostgreSQL Database Setup Script

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS mental_health_assessments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS therapy_sessions CASCADE;
DROP TABLE IF EXISTS booking_requests CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS therapy_definitions CASCADE;
DROP TABLE IF EXISTS therapists CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS therapy_type CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;

-- Create custom types
CREATE TYPE user_role AS ENUM ('patient', 'therapist', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE therapy_type AS ENUM ('abhyanga', 'shirodhara', 'panchakarma', 'nasya', 'basti', 'virechana');
CREATE TYPE session_status AS ENUM ('scheduled', 'checked_in', 'in_progress', 'completed', 'no_show', 'cancelled');

-- Users table (base table for all user types)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL,
    language_preference VARCHAR(50) DEFAULT 'English',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    medical_history TEXT,
    emergency_contact VARCHAR(20),
    address TEXT
);

-- Therapists table
CREATE TABLE therapists (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specializations therapy_type[] NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 0,
    availability_start TIME NOT NULL DEFAULT '09:00',
    availability_end TIME NOT NULL DEFAULT '17:00',
    availability_days TEXT[] NOT NULL DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    is_active BOOLEAN DEFAULT true
);

-- Admins table
CREATE TABLE admins (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    permissions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
);

-- Therapy definitions table
CREATE TABLE therapy_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type therapy_type NOT NULL,
    duration_minutes INTEGER NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    preparation_time INTEGER DEFAULT 15,
    cleanup_time INTEGER DEFAULT 15,
    required_equipment TEXT[] DEFAULT ARRAY[]::TEXT[],
    contraindications TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 1,
    equipment TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Booking requests table
CREATE TABLE booking_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    therapy_id UUID NOT NULL REFERENCES therapy_definitions(id) ON DELETE CASCADE,
    preferred_therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    preferred_date DATE NOT NULL,
    preferred_time_slot TIME NOT NULL,
    notes TEXT,
    status booking_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Therapy sessions table
CREATE TABLE therapy_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_request_id UUID NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    therapy_id UUID NOT NULL REFERENCES therapy_definitions(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    status session_status DEFAULT 'scheduled',
    therapist_notes TEXT,
    patient_vitals JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mental health assessments table
CREATE TABLE mental_health_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES therapy_sessions(id) ON DELETE SET NULL,
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    anxiety_level INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    notes TEXT,
    assessment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_booking_requests_patient_id ON booking_requests(patient_id);
CREATE INDEX idx_booking_requests_status ON booking_requests(status);
CREATE INDEX idx_therapy_sessions_patient_id ON therapy_sessions(patient_id);
CREATE INDEX idx_therapy_sessions_therapist_id ON therapy_sessions(therapist_id);
CREATE INDEX idx_therapy_sessions_scheduled_start ON therapy_sessions(scheduled_start);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_booking_requests_updated_at BEFORE UPDATE ON booking_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_therapy_sessions_updated_at BEFORE UPDATE ON therapy_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
