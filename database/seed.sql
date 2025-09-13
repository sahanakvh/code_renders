-- Updated seed data with password hashes for demo users
-- Default password for all demo users: "password123"
-- Note: No DELETE statements needed since schema is dropped and recreated

-- Insert sample therapy definitions first
INSERT INTO therapy_definitions (id, name, type, duration_minutes, description, price, preparation_time, cleanup_time, required_equipment, contraindications) VALUES
('11111111-1111-1111-1111-111111111111', 'Traditional Abhyanga', 'abhyanga', 60, 'Full body massage with warm herbal oils', 1500.00, 15, 15, ARRAY['massage_table', 'herbal_oils', 'towels'], ARRAY['open_wounds', 'fever', 'acute_illness']),
('22222222-2222-2222-2222-222222222222', 'Calming Shirodhara', 'shirodhara', 45, 'Continuous stream of warm oil poured on forehead', 1800.00, 20, 20, ARRAY['shirodhara_table', 'special_oils', 'collection_vessel'], ARRAY['head_injuries', 'scalp_infections']),
('33333333-3333-3333-3333-333333333333', 'Panchakarma Detox', 'panchakarma', 90, 'Complete detoxification therapy program', 3000.00, 30, 30, ARRAY['special_equipment', 'herbal_medicines'], ARRAY['pregnancy', 'severe_illness']),
('44444444-4444-4444-4444-444444444444', 'Nasya Treatment', 'nasya', 30, 'Nasal administration of medicated oils', 1200.00, 10, 10, ARRAY['nasal_drops', 'cotton_swabs'], ARRAY['nasal_infections', 'bleeding_disorders']),
('55555555-5555-5555-5555-555555555555', 'Basti Therapy', 'basti', 75, 'Medicated enema therapy for digestive health', 2200.00, 25, 25, ARRAY['enema_equipment', 'medicated_oils'], ARRAY['rectal_bleeding', 'severe_dehydration']),
('66666666-6666-6666-6666-666666666666', 'Virechana Cleansing', 'virechana', 120, 'Therapeutic purgation for liver detox', 2500.00, 30, 30, ARRAY['herbal_medicines', 'monitoring_equipment'], ARRAY['pregnancy', 'weakness']);

-- Insert sample rooms
INSERT INTO rooms (id, name, capacity, equipment, is_available) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Abhyanga Suite 1', 1, ARRAY['massage_table', 'oil_warmer', 'towel_warmer', 'aromatherapy_diffuser'], true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Shirodhara Chamber', 1, ARRAY['shirodhara_table', 'oil_collection_system', 'ambient_lighting'], true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Panchakarma Center', 1, ARRAY['treatment_table', 'steam_chamber', 'herbal_storage'], true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Multi-purpose Room A', 2, ARRAY['massage_tables', 'storage_cabinets', 'sink'], true),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Consultation Room', 1, ARRAY['examination_table', 'chair', 'weighing_scale'], true);

-- Insert demo users with hashed passwords
-- Password for all demo users: "password123"
-- Hash: $2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi (bcrypt hash for "password123")

-- Demo patients
INSERT INTO users (id, email, password_hash, full_name, phone, role, language_preference) VALUES
('10000000-0000-0000-0000-000000000001', 'patient@demo.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Patient', '+91-9876543210', 'patient', 'English'),
('10000000-0000-0000-0000-000000000002', 'john.smith@email.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Smith', '+91-9876543212', 'patient', 'English'),
('10000000-0000-0000-0000-000000000003', 'priya.sharma@email.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Priya Sharma', '+91-9876543214', 'patient', 'Hindi'),
('10000000-0000-0000-0000-000000000004', 'rajesh.kumar@email.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rajesh Kumar', '+91-9876543216', 'patient', 'Hindi'),
('10000000-0000-0000-0000-000000000005', 'sarah.johnson@email.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah Johnson', '+91-9876543218', 'patient', 'English');

-- Insert patient details
INSERT INTO patients (id, date_of_birth, gender, medical_history, emergency_contact, address) VALUES
('10000000-0000-0000-0000-000000000001', '1985-05-15', 'Male', 'Demo patient for testing', '+91-9876543211', '123 Demo St, Demo City'),
('10000000-0000-0000-0000-000000000002', '1985-05-15', 'Male', 'Chronic back pain, stress-related issues', '+91-9876543211', '123 Main St, Mumbai, Maharashtra 400001'),
('10000000-0000-0000-0000-000000000003', '1990-08-22', 'Female', 'Anxiety, insomnia, digestive issues', '+91-9876543213', '456 Park Ave, Delhi, Delhi 110001'),
('10000000-0000-0000-0000-000000000004', '1978-12-10', 'Male', 'Hypertension, joint pain, stress', '+91-9876543215', '789 Ring Road, Bangalore, Karnataka 560001'),
('10000000-0000-0000-0000-000000000005', '1992-03-08', 'Female', 'Migraines, work stress, poor sleep', '+91-9876543217', '321 Garden St, Chennai, Tamil Nadu 600001');

-- Demo therapists  
INSERT INTO users (id, email, password_hash, full_name, phone, role, language_preference) VALUES
('20000000-0000-0000-0000-000000000001', 'therapist@demo.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Therapist', '+91-9876543220', 'therapist', 'English'),
('20000000-0000-0000-0000-000000000002', 'dr.meera@ayursutra.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Meera Patel', '+91-9876543221', 'therapist', 'English'),
('20000000-0000-0000-0000-000000000003', 'dr.anand@ayursutra.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Anand Gupta', '+91-9876543222', 'therapist', 'Hindi'),
('20000000-0000-0000-0000-000000000004', 'dr.kavitha@ayursutra.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Kavitha Rao', '+91-9876543223', 'therapist', 'English');

-- Insert therapist details
INSERT INTO therapists (id, specializations, experience_years, availability_start, availability_end, availability_days, is_active) VALUES
('20000000-0000-0000-0000-000000000001', ARRAY['abhyanga', 'shirodhara']::therapy_type[], 5, '09:00', '17:00', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], true),
('20000000-0000-0000-0000-000000000002', ARRAY['abhyanga', 'shirodhara', 'panchakarma']::therapy_type[], 8, '09:00', '17:00', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], true),
('20000000-0000-0000-0000-000000000003', ARRAY['basti', 'virechana', 'nasya']::therapy_type[], 12, '08:00', '16:00', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], true),
('20000000-0000-0000-0000-000000000004', ARRAY['abhyanga', 'shirodhara']::therapy_type[], 6, '10:00', '18:00', ARRAY['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], true);

-- Insert admin user
INSERT INTO users (id, email, password_hash, full_name, phone, role, language_preference) VALUES
('30000000-0000-0000-0000-000000000001', 'admin@demo.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Admin', '+91-9876543230', 'admin', 'English');

INSERT INTO admins (id, permissions) VALUES
('30000000-0000-0000-0000-000000000001', ARRAY['manage_users', 'manage_therapies', 'view_reports', 'manage_system']);

-- Add some sample booking requests
INSERT INTO booking_requests (id, patient_id, therapy_id, preferred_therapist_id, preferred_date, preferred_time_slot, notes, status) VALUES
('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '20000000-0000-0000-0000-000000000001', '2024-12-20', '10:00', 'First time booking, please be gentle', 'confirmed'),
('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', '20000000-0000-0000-0000-000000000002', '2024-12-21', '14:00', 'Prefer afternoon session', 'pending'),
('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', '20000000-0000-0000-0000-000000000003', '2024-12-22', '09:00', 'Full detox program requested', 'confirmed');

-- Insert sample therapy sessions
INSERT INTO therapy_sessions (id, booking_request_id, patient_id, therapist_id, therapy_id, room_id, scheduled_start, scheduled_end, status, therapist_notes, patient_vitals) VALUES
('51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-12-15 10:00:00+00', '2024-12-15 11:00:00+00', 'completed', 'Patient responded well to treatment. Reported reduced tension.', '{"blood_pressure": "120/80", "heart_rate": 72, "temperature": 98.6, "notes": "Normal vitals throughout session"}'),
('51000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-12-17 11:00:00+00', '2024-12-17 11:30:00+00', 'scheduled', null, null);

-- Insert sample mental health assessments
INSERT INTO mental_health_assessments (id, patient_id, session_id, stress_level, anxiety_level, mood_rating, sleep_quality, energy_level, notes) VALUES
('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001', 3, 4, 8, 7, 8, 'Significant improvement in stress and mood after abhyanga treatment'),
('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', null, 8, 9, 4, 3, 4, 'High stress and anxiety levels, poor sleep quality - recommended for shirodhara'),
('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', null, 6, 5, 6, 6, 6, 'Moderate stress levels, maintains regular treatment schedule');

-- Insert sample notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES
('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Appointment Confirmed', 'Your abhyanga session is confirmed for Dec 15 at 10:00 AM', 'appointment', true),
('70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Booking Pending', 'Your shirodhara request is under review. We will confirm soon.', 'booking', false),
('70000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'New Patient Alert', 'You have a new patient (John Smith) scheduled for tomorrow', 'patient', false),
('70000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Reminder', 'Please arrive 15 minutes early for your appointment preparation', 'reminder', false),
('70000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', 'System Update', 'Database backup completed successfully', 'system', true);
