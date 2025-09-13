-- Seed data for Ayur Flow Sutra Database
-- This script populates the database with sample data

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

-- Insert sample users (patients)
INSERT INTO users (id, email, full_name, phone, role, language_preference) VALUES
('10000000-0000-0000-0000-000000000001', 'john.smith@email.com', 'John Smith', '+91-9876543210', 'patient', 'English'),
('10000000-0000-0000-0000-000000000002', 'priya.sharma@email.com', 'Priya Sharma', '+91-9876543212', 'patient', 'Hindi'),
('10000000-0000-0000-0000-000000000003', 'rajesh.kumar@email.com', 'Rajesh Kumar', '+91-9876543214', 'patient', 'Hindi'),
('10000000-0000-0000-0000-000000000004', 'sarah.johnson@email.com', 'Sarah Johnson', '+91-9876543216', 'patient', 'English'),
('10000000-0000-0000-0000-000000000005', 'amit.patel@email.com', 'Amit Patel', '+91-9876543218', 'patient', 'Gujarati');

-- Insert patient details
INSERT INTO patients (id, date_of_birth, gender, medical_history, emergency_contact, address) VALUES
('10000000-0000-0000-0000-000000000001', '1985-05-15', 'Male', 'Chronic back pain, stress-related issues', '+91-9876543211', '123 Main St, Mumbai, Maharashtra 400001'),
('10000000-0000-0000-0000-000000000002', '1990-08-22', 'Female', 'Anxiety, insomnia, digestive issues', '+91-9876543213', '456 Park Ave, Delhi, Delhi 110001'),
('10000000-0000-0000-0000-000000000003', '1978-12-10', 'Male', 'Hypertension, joint pain, stress', '+91-9876543215', '789 Ring Road, Bangalore, Karnataka 560001'),
('10000000-0000-0000-0000-000000000004', '1992-03-08', 'Female', 'Migraines, work stress, poor sleep', '+91-9876543217', '321 Garden St, Chennai, Tamil Nadu 600001'),
('10000000-0000-0000-0000-000000000005', '1987-11-25', 'Male', 'Diabetes, weight management, fatigue', '+91-9876543219', '654 Lake View, Pune, Maharashtra 411001');

-- Insert sample therapists
INSERT INTO users (id, email, full_name, phone, role, language_preference) VALUES
('20000000-0000-0000-0000-000000000001', 'dr.meera@ayursutra.com', 'Dr. Meera Patel', '+91-9876543220', 'therapist', 'English'),
('20000000-0000-0000-0000-000000000002', 'dr.anand@ayursutra.com', 'Dr. Anand Gupta', '+91-9876543221', 'therapist', 'Hindi'),
('20000000-0000-0000-0000-000000000003', 'dr.kavitha@ayursutra.com', 'Dr. Kavitha Rao', '+91-9876543222', 'therapist', 'English'),
('20000000-0000-0000-0000-000000000004', 'dr.rohit@ayursutra.com', 'Dr. Rohit Sharma', '+91-9876543223', 'therapist', 'Hindi');

-- Insert therapist details
INSERT INTO therapists (id, specializations, experience_years, availability_start, availability_end, availability_days, is_active) VALUES
('20000000-0000-0000-0000-000000000001', ARRAY['abhyanga', 'shirodhara', 'panchakarma']::therapy_type[], 8, '09:00', '17:00', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], true),
('20000000-0000-0000-0000-000000000002', ARRAY['basti', 'virechana', 'nasya']::therapy_type[], 12, '08:00', '16:00', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], true),
('20000000-0000-0000-0000-000000000003', ARRAY['abhyanga', 'shirodhara']::therapy_type[], 6, '10:00', '18:00', ARRAY['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], true),
('20000000-0000-0000-0000-000000000004', ARRAY['panchakarma', 'basti']::therapy_type[], 10, '09:00', '17:00', ARRAY['monday', 'wednesday', 'friday', 'saturday'], true);

-- Insert sample admin
INSERT INTO users (id, email, full_name, phone, role, language_preference) VALUES
('30000000-0000-0000-0000-000000000001', 'admin@ayursutra.com', 'System Administrator', '+91-9876543230', 'admin', 'English');

INSERT INTO admins (id, permissions) VALUES
('30000000-0000-0000-0000-000000000001', ARRAY['manage_users', 'manage_therapies', 'manage_bookings', 'view_reports', 'system_settings']);

-- Insert sample booking requests
INSERT INTO booking_requests (id, patient_id, therapy_id, preferred_therapist_id, preferred_date, preferred_time_slot, notes, status) VALUES
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '20000000-0000-0000-0000-000000000001', '2024-12-15', '10:00', 'First time patient, please be gentle', 'confirmed'),
('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', '20000000-0000-0000-0000-000000000001', '2024-12-16', '14:00', 'Suffers from anxiety, needs calming environment', 'pending'),
('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', '20000000-0000-0000-0000-000000000002', '2024-12-17', '11:00', 'Regular patient, familiar with treatment', 'confirmed'),
('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', '20000000-0000-0000-0000-000000000003', '2024-12-18', '15:00', 'Prefers female therapist', 'pending'),
('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555', '20000000-0000-0000-0000-000000000002', '2024-12-19', '09:00', 'Diabetic patient, monitor vitals', 'confirmed');

-- Insert sample therapy sessions
INSERT INTO therapy_sessions (id, booking_request_id, patient_id, therapist_id, therapy_id, room_id, scheduled_start, scheduled_end, status, therapist_notes, patient_vitals) VALUES
('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-12-15 10:00:00+00', '2024-12-15 11:00:00+00', 'completed', 'Patient responded well to treatment. Reported reduced tension.', '{"blood_pressure": "120/80", "heart_rate": 72, "temperature": 98.6, "notes": "Normal vitals throughout session"}'),
('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-12-17 11:00:00+00', '2024-12-17 11:30:00+00', 'scheduled', null, null),
('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-12-19 09:00:00+00', '2024-12-19 10:15:00+00', 'scheduled', null, null);

-- Insert sample mental health assessments
INSERT INTO mental_health_assessments (id, patient_id, session_id, stress_level, anxiety_level, mood_rating, sleep_quality, energy_level, notes) VALUES
('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 3, 4, 8, 7, 8, 'Significant improvement in stress and mood after abhyanga treatment'),
('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', null, 8, 9, 4, 3, 4, 'High stress and anxiety levels, poor sleep quality - recommended for shirodhara'),
('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', null, 6, 5, 6, 6, 6, 'Moderate stress levels, maintains regular treatment schedule');

-- Insert sample notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES
('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Appointment Confirmed', 'Your abhyanga session is confirmed for Dec 15 at 10:00 AM', 'appointment', true),
('70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Booking Pending', 'Your shirodhara request is under review. We will confirm soon.', 'booking', false),
('70000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'New Patient Alert', 'You have a new patient (John Smith) scheduled for tomorrow', 'patient', false),
('70000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Reminder', 'Please arrive 15 minutes early for your appointment preparation', 'reminder', false),
('70000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', 'System Update', 'Database backup completed successfully', 'system', true);
