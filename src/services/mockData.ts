// Mock data for development - this simulates your PostgreSQL database
// In production, this will be replaced with actual database queries

import {
  Patient,
  Therapist,
  Admin,
  TherapyDefinition,
  Room,
  BookingRequest,
  TherapySession,
  MentalHealthAssessment,
  Notification
} from '../types';

// Sample Patients
export const mockPatients: Patient[] = [
  {
    id: 'patient_001',
    email: 'john.smith@email.com',
    full_name: 'John Smith',
    phone: '+91-9876543210',
    role: 'patient',
    language_preference: 'English',
    date_of_birth: '1985-05-15',
    gender: 'Male',
    medical_history: 'Chronic back pain, stress-related issues',
    emergency_contact: '+91-9876543211',
    address: '123 Main St, Mumbai, Maharashtra 400001',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'patient_002',
    email: 'priya.sharma@email.com',
    full_name: 'Priya Sharma',
    phone: '+91-9876543212',
    role: 'patient',
    language_preference: 'Hindi',
    date_of_birth: '1990-08-22',
    gender: 'Female',
    medical_history: 'Anxiety, insomnia, digestive issues',
    emergency_contact: '+91-9876543213',
    address: '456 Park Ave, Delhi, Delhi 110001',
    created_at: '2024-01-16T11:30:00Z',
    updated_at: '2024-01-16T11:30:00Z'
  },
  {
    id: 'patient_003',
    email: 'rajesh.kumar@email.com',
    full_name: 'Rajesh Kumar',
    phone: '+91-9876543214',
    role: 'patient',
    language_preference: 'Hindi',
    date_of_birth: '1978-12-10',
    gender: 'Male',
    medical_history: 'Hypertension, joint pain, stress',
    emergency_contact: '+91-9876543215',
    address: '789 Ring Road, Bangalore, Karnataka 560001',
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T09:15:00Z'
  }
];

// Sample Therapists
export const mockTherapists: Therapist[] = [
  {
    id: 'therapist_001',
    email: 'dr.meera@ayursutra.com',
    full_name: 'Dr. Meera Patel',
    phone: '+91-9876543220',
    role: 'therapist',
    language_preference: 'English',
    specializations: ['abhyanga', 'shirodhara', 'panchakarma'],
    experience_years: 8,
    availability_hours: {
      start: '09:00',
      end: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    is_active: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z'
  },
  {
    id: 'therapist_002',
    email: 'dr.anand@ayursutra.com',
    full_name: 'Dr. Anand Gupta',
    phone: '+91-9876543221',
    role: 'therapist',
    language_preference: 'Hindi',
    specializations: ['basti', 'virechana', 'nasya'],
    experience_years: 12,
    availability_hours: {
      start: '08:00',
      end: '16:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    is_active: true,
    created_at: '2024-01-11T08:00:00Z',
    updated_at: '2024-01-11T08:00:00Z'
  },
  {
    id: 'therapist_003',
    email: 'dr.kavya@ayursutra.com',
    full_name: 'Dr. Kavya Nair',
    phone: '+91-9876543222',
    role: 'therapist',
    language_preference: 'English',
    specializations: ['shirodhara', 'abhyanga', 'nasya'],
    experience_years: 6,
    availability_hours: {
      start: '10:00',
      end: '18:00',
      days: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    is_active: true,
    created_at: '2024-01-12T08:00:00Z',
    updated_at: '2024-01-12T08:00:00Z'
  }
];

// Sample Admins
export const mockAdmins: Admin[] = [
  {
    id: 'admin_001',
    email: 'admin@ayursutra.com',
    full_name: 'Ayursutra Administrator',
    phone: '+91-9876543230',
    role: 'admin',
    language_preference: 'English',
    permissions: ['manage_users', 'manage_bookings', 'view_reports', 'manage_system'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Sample Therapy Definitions
export const mockTherapies: TherapyDefinition[] = [
  {
    id: 'therapy_001',
    name: 'Abhyanga',
    type: 'abhyanga',
    duration_minutes: 60,
    description: 'Full body massage with warm herbal oils to improve circulation and reduce stress',
    price: 2500,
    preparation_time: 15,
    cleanup_time: 15,
    required_equipment: ['massage_table', 'herbal_oils', 'towels', 'heater'],
    contraindications: ['fever', 'acute_illness', 'open_wounds'],
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'therapy_002',
    name: 'Shirodhara',
    type: 'shirodhara',
    duration_minutes: 45,
    description: 'Continuous pouring of warm oil on forehead for deep relaxation and mental clarity',
    price: 3000,
    preparation_time: 20,
    cleanup_time: 20,
    required_equipment: ['shirodhara_stand', 'special_oils', 'towels', 'pillow'],
    contraindications: ['head_injuries', 'severe_anxiety', 'hypertension'],
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'therapy_003',
    name: 'Panchakarma Detox',
    type: 'panchakarma',
    duration_minutes: 120,
    description: 'Complete detoxification program including multiple therapeutic procedures',
    price: 8000,
    preparation_time: 30,
    cleanup_time: 30,
    required_equipment: ['massage_table', 'steam_box', 'herbal_medicines', 'specialized_tools'],
    contraindications: ['pregnancy', 'severe_heart_conditions', 'acute_infections'],
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'therapy_004',
    name: 'Nasya',
    type: 'nasya',
    duration_minutes: 30,
    description: 'Nasal administration of herbal medicines for respiratory and neurological health',
    price: 1500,
    preparation_time: 10,
    cleanup_time: 10,
    required_equipment: ['nasal_drops', 'specialized_tubes', 'towels'],
    contraindications: ['nasal_infections', 'severe_allergies', 'bleeding_disorders'],
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'therapy_005',
    name: 'Basti',
    type: 'basti',
    duration_minutes: 90,
    description: 'Medicated enema therapy for digestive and neurological disorders',
    price: 4000,
    preparation_time: 25,
    cleanup_time: 25,
    required_equipment: ['enema_kit', 'herbal_decoctions', 'specialized_tubes'],
    contraindications: ['intestinal_bleeding', 'severe_diarrhea', 'anal_fissures'],
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Sample Rooms
export const mockRooms: Room[] = [
  {
    id: 'room_001',
    name: 'Serenity Suite',
    capacity: 1,
    equipment: ['massage_table', 'heater', 'sound_system', 'essential_oils'],
    is_available: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'room_002',
    name: 'Healing Chamber',
    capacity: 1,
    equipment: ['shirodhara_stand', 'massage_table', 'specialized_lighting'],
    is_available: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'room_003',
    name: 'Detox Center',
    capacity: 1,
    equipment: ['steam_box', 'massage_table', 'specialized_tools', 'ventilation'],
    is_available: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'room_004',
    name: 'Respiratory Therapy',
    capacity: 1,
    equipment: ['reclining_chair', 'nasal_administration_tools', 'air_purifier'],
    is_available: true,
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Sample Booking Requests
export const mockBookingRequests: BookingRequest[] = [
  {
    id: 'booking_001',
    patient_id: 'patient_001',
    therapy_id: 'therapy_001',
    preferred_therapist_id: 'therapist_001',
    preferred_date: '2024-12-15',
    preferred_time_slot: '10:00-11:00',
    notes: 'First time patient, please provide detailed consultation',
    status: 'confirmed',
    created_at: '2024-12-10T09:00:00Z',
    updated_at: '2024-12-10T10:30:00Z'
  },
  {
    id: 'booking_002',
    patient_id: 'patient_002',
    therapy_id: 'therapy_002',
    preferred_therapist_id: 'therapist_003',
    preferred_date: '2024-12-15',
    preferred_time_slot: '14:00-14:45',
    notes: 'Patient has sensitivity to certain oils',
    status: 'pending',
    created_at: '2024-12-11T11:15:00Z',
    updated_at: '2024-12-11T11:15:00Z'
  },
  {
    id: 'booking_003',
    patient_id: 'patient_003',
    therapy_id: 'therapy_003',
    preferred_date: '2024-12-16',
    preferred_time_slot: '09:00-11:00',
    notes: 'Follow-up session for ongoing treatment',
    status: 'confirmed',
    created_at: '2024-12-11T15:30:00Z',
    updated_at: '2024-12-11T16:00:00Z'
  }
];

// Sample Therapy Sessions
export const mockTherapySessions: TherapySession[] = [
  {
    id: 'session_001',
    booking_request_id: 'booking_001',
    patient_id: 'patient_001',
    therapist_id: 'therapist_001',
    therapy_id: 'therapy_001',
    room_id: 'room_001',
    scheduled_start: '2024-12-15T10:00:00Z',
    scheduled_end: '2024-12-15T11:00:00Z',
    status: 'scheduled',
    created_at: '2024-12-10T10:30:00Z',
    updated_at: '2024-12-10T10:30:00Z'
  },
  {
    id: 'session_002',
    booking_request_id: 'booking_003',
    patient_id: 'patient_003',
    therapist_id: 'therapist_002',
    therapy_id: 'therapy_003',
    room_id: 'room_003',
    scheduled_start: '2024-12-16T09:00:00Z',
    scheduled_end: '2024-12-16T11:00:00Z',
    status: 'scheduled',
    created_at: '2024-12-11T16:00:00Z',
    updated_at: '2024-12-11T16:00:00Z'
  },
  {
    id: 'session_003',
    booking_request_id: 'booking_002',
    patient_id: 'patient_001',
    therapist_id: 'therapist_001',
    therapy_id: 'therapy_001',
    room_id: 'room_001',
    scheduled_start: '2024-12-13T14:00:00Z',
    scheduled_end: '2024-12-13T15:00:00Z',
    actual_start: '2024-12-13T14:05:00Z',
    actual_end: '2024-12-13T15:10:00Z',
    status: 'completed',
    therapist_notes: 'Patient responded well to treatment. Recommended weekly follow-ups.',
    patient_vitals: {
      blood_pressure: '120/80',
      heart_rate: 72,
      temperature: 98.6,
      notes: 'All vitals normal, patient relaxed after session'
    },
    created_at: '2024-12-10T10:30:00Z',
    updated_at: '2024-12-13T15:15:00Z'
  }
];

// Sample Mental Health Assessments
export const mockAssessments: MentalHealthAssessment[] = [
  {
    id: 'assessment_001',
    patient_id: 'patient_002',
    assessment_type: 'PHQ-9',
    responses: {
      'q1': 1, 'q2': 2, 'q3': 1, 'q4': 2, 'q5': 1,
      'q6': 0, 'q7': 1, 'q8': 1, 'q9': 0
    },
    total_score: 9,
    severity_level: 'Mild Depression',
    taken_at: '2024-12-10T08:00:00Z',
    session_id: 'session_003'
  },
  {
    id: 'assessment_002',
    patient_id: 'patient_002',
    assessment_type: 'GAD-7',
    responses: {
      'q1': 2, 'q2': 2, 'q3': 1, 'q4': 2, 'q5': 1, 'q6': 1, 'q7': 1
    },
    total_score: 10,
    severity_level: 'Moderate Anxiety',
    taken_at: '2024-12-10T08:15:00Z'
  }
];

// Sample Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif_001',
    recipient_id: 'patient_001',
    type: 'reminder',
    title: 'Therapy Session Tomorrow',
    message: 'Your Abhyanga session with Dr. Meera Patel is scheduled for tomorrow at 10:00 AM',
    channels: ['email', 'sms', 'in_app'],
    scheduled_for: '2024-12-14T18:00:00Z',
    sent_at: '2024-12-14T18:00:05Z',
    is_read: false,
    created_at: '2024-12-14T10:00:00Z'
  },
  {
    id: 'notif_002',
    recipient_id: 'therapist_001',
    type: 'schedule_update',
    title: 'New Booking Confirmed',
    message: 'New Abhyanga session scheduled with John Smith for Dec 15 at 10:00 AM',
    channels: ['email', 'in_app'],
    scheduled_for: '2024-12-10T10:30:00Z',
    sent_at: '2024-12-10T10:30:02Z',
    is_read: true,
    created_at: '2024-12-10T10:30:00Z'
  },
  {
    id: 'notif_003',
    recipient_id: 'patient_002',
    type: 'booking_confirmation',
    title: 'Booking Request Received',
    message: 'Your Shirodhara therapy request has been received and is pending approval',
    channels: ['email', 'in_app'],
    scheduled_for: '2024-12-11T11:15:00Z',
    sent_at: '2024-12-11T11:15:01Z',
    is_read: false,
    created_at: '2024-12-11T11:15:00Z'
  }
];