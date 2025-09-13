// TypeScript interfaces for PostgreSQL database schema
// These types match the exact structure you'll use in your PostgreSQL database

export type UserRole = 'patient' | 'therapist' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type TherapyType = 'abhyanga' | 'shirodhara' | 'panchakarma' | 'nasya' | 'basti' | 'virechana';
export type SessionStatus = 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'no_show' | 'cancelled';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  language_preference: string;
  created_at: string;
  updated_at: string;
}

export interface Patient extends User {
  role: 'patient';
  date_of_birth?: string;
  gender?: string;
  medical_history?: string;
  emergency_contact?: string;
  address?: string;
}

export interface Therapist extends User {
  role: 'therapist';
  specializations: TherapyType[];
  experience_years: number;
  availability_hours: {
    start: string;
    end: string;
    days: string[];
  };
  is_active: boolean;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

export interface TherapyDefinition {
  id: string;
  name: string;
  type: TherapyType;
  duration_minutes: number;
  description: string;
  price: number;
  preparation_time: number;
  cleanup_time: number;
  required_equipment: string[];
  contraindications: string[];
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  is_available: boolean;
  created_at: string;
}

export interface BookingRequest {
  id: string;
  patient_id: string;
  therapy_id: string;
  preferred_therapist_id?: string;
  preferred_date: string;
  preferred_time_slot: string;
  notes?: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface TherapySession {
  id: string;
  booking_request_id: string;
  patient_id: string;
  therapist_id: string;
  therapy_id: string;
  room_id: string;
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  status: SessionStatus;
  therapist_notes?: string;
  patient_vitals?: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    notes?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface MentalHealthAssessment {
  id: string;
  patient_id: string;
  assessment_type: 'PHQ-9' | 'GAD-7' | 'GHQ';
  responses: Record<string, number>;
  total_score: number;
  severity_level: string;
  taken_at: string;
  session_id?: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  type: 'reminder' | 'booking_confirmation' | 'cancellation' | 'schedule_update';
  title: string;
  message: string;
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  scheduled_for: string;
  sent_at?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Scheduling Algorithm Types
export interface TimeSlot {
  start: string;
  end: string;
  duration: number;
}

export interface ResourceConstraint {
  therapist_id: string;
  room_id: string;
  therapy_type: TherapyType;
  available_slots: TimeSlot[];
}

export interface SchedulingRequest {
  patient_id: string;
  therapy_id: string;
  preferred_therapist_id?: string;
  preferred_date: string;
  priority: number;
  constraints: ResourceConstraint[];
}

export interface GanttTask {
  id: string;
  text: string;
  start_date: string;
  end_date: string;
  duration: number;
  progress: number;
  parent?: string;
  type: 'task' | 'project' | 'milestone';
  resource: string;
  therapy_type: TherapyType;
  patient_name: string;
  therapist_name: string;
  room_name: string;
  status: SessionStatus;
}