-- Updated seed data with password hashes for demo users (without DELETE statements)
-- Default password for all demo users: "password123"

-- Insert sample therapy definitions first
INSERT INTO therapy_definitions (id, name, type, duration_minutes, description, price, preparation_time, cleanup_time, required_equipment, contraindications) VALUES
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

-- Demo patients
INSERT INTO users (id, email, password_hash, full_name, phone, role, language_preference) VALUES
('10000000-0000-0000-0000-000000000002', 'john.smith@email.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Smith', '+91-9876543212', 'patient', 'English'),
('10000000-0000-0000-0000-000000000003', 'priya.sharma@email.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Priya Sharma', '+91-9876543214', 'patient', 'Hindi');

-- Insert patient details
INSERT INTO patients (id, date_of_birth, gender, medical_history, emergency_contact, address) VALUES
('10000000-0000-0000-0000-000000000002', '1985-05-15', 'Male', 'Chronic back pain, stress-related issues', '+91-9876543211', '123 Main St, Mumbai, Maharashtra 400001'),
('10000000-0000-0000-0000-000000000003', '1990-08-22', 'Female', 'Anxiety, insomnia, digestive issues', '+91-9876543213', '456 Park Ave, Delhi, Delhi 110001');

-- Demo therapists  
INSERT INTO users (id, email, password_hash, full_name, phone, role, language_preference) VALUES
('20000000-0000-0000-0000-000000000001', 'therapist@demo.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Therapist', '+91-9876543220', 'therapist', 'English'),
('20000000-0000-0000-0000-000000000002', 'dr.meera@ayursutra.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Meera Patel', '+91-9876543221', 'therapist', 'English');

-- Insert therapist details
INSERT INTO therapists (id, specializations, experience_years, availability_start, availability_end, availability_days, is_active) VALUES
('20000000-0000-0000-0000-000000000001', ARRAY['abhyanga', 'shirodhara']::therapy_type[], 5, '09:00', '17:00', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], true),
('20000000-0000-0000-0000-000000000002', ARRAY['abhyanga', 'shirodhara', 'panchakarma']::therapy_type[], 8, '09:00', '17:00', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], true);

-- Insert admin user
INSERT INTO users (id, email, password_hash, full_name, phone, role, language_preference) VALUES
('30000000-0000-0000-0000-000000000001', 'admin@demo.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Admin', '+91-9876543230', 'admin', 'English');

INSERT INTO admins (id, permissions) VALUES
('30000000-0000-0000-0000-000000000001', ARRAY['manage_users', 'manage_therapies', 'view_reports', 'manage_system']);
