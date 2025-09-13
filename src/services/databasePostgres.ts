// Database Service Layer - PostgreSQL Implementation
// Real database operations using PostgreSQL

import {
  User,
  Patient,
  Therapist,
  Admin,
  TherapyDefinition,
  Room,
  BookingRequest,
  TherapySession,
  MentalHealthAssessment,
  Notification,
  AuditLog,
  UserRole,
  BookingStatus,
  SessionStatus,
  TherapyType
} from '../types';

import DatabaseConnection from './dbConnection';

// ============================================================================
// DATABASE SERVICE IMPLEMENTATION
// ============================================================================

class DatabaseService {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  // Initialize database connection
  async initialize(): Promise<void> {
    await this.db.connect();
  }

  // Cleanup database connection
  async cleanup(): Promise<void> {
    await this.db.disconnect();
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  async getAllUsers(): Promise<User[]> {
    const query = `
      SELECT id, email, full_name, phone, role, language_preference, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    const result = await this.db.query<User>(query);
    return result.rows;
  }

  async getUserById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, full_name, phone, role, language_preference, created_at, updated_at 
      FROM users 
      WHERE id = $1
    `;
    const result = await this.db.query<User>(query, [id]);
    return result.rows[0] || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, full_name, phone, role, language_preference, created_at, updated_at 
      FROM users 
      WHERE email = $1
    `;
    const result = await this.db.query<User>(query, [email]);
    return result.rows[0] || null;
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const query = `
      SELECT id, email, full_name, phone, role, language_preference, created_at, updated_at 
      FROM users 
      WHERE role = $1 
      ORDER BY created_at DESC
    `;
    const result = await this.db.query<User>(query, [role]);
    return result.rows;
  }

  // ============================================================================
  // PATIENT MANAGEMENT
  // ============================================================================

  async getPatients(): Promise<Patient[]> {
    const query = `
      SELECT 
        u.id, u.email, u.full_name, u.phone, u.role, u.language_preference, u.created_at, u.updated_at,
        p.date_of_birth, p.gender, p.medical_history, p.emergency_contact, p.address
      FROM users u
      JOIN patients p ON u.id = p.id
      WHERE u.role = 'patient'
      ORDER BY u.created_at DESC
    `;
    const result = await this.db.query<Patient>(query);
    return result.rows;
  }

  async getPatientById(id: string): Promise<Patient | null> {
    const query = `
      SELECT 
        u.id, u.email, u.full_name, u.phone, u.role, u.language_preference, u.created_at, u.updated_at,
        p.date_of_birth, p.gender, p.medical_history, p.emergency_contact, p.address
      FROM users u
      JOIN patients p ON u.id = p.id
      WHERE u.id = $1 AND u.role = 'patient'
    `;
    const result = await this.db.query<Patient>(query, [id]);
    return result.rows[0] || null;
  }

  async createPatient(patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    return await this.db.transaction(async (client) => {
      // Insert user
      const userQuery = `
        INSERT INTO users (email, full_name, phone, role, language_preference)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, full_name, phone, role, language_preference, created_at, updated_at
      `;
      const userResult = await client.query<User>(userQuery, [
        patientData.email,
        patientData.full_name,
        patientData.phone,
        'patient',
        patientData.language_preference
      ]);
      const user = userResult.rows[0];

      // Insert patient details
      const patientQuery = `
        INSERT INTO patients (id, date_of_birth, gender, medical_history, emergency_contact, address)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await client.query(patientQuery, [
        user.id,
        patientData.date_of_birth,
        patientData.gender,
        patientData.medical_history,
        patientData.emergency_contact,
        patientData.address
      ]);

      return {
        ...user,
        role: 'patient' as const,
        date_of_birth: patientData.date_of_birth,
        gender: patientData.gender,
        medical_history: patientData.medical_history,
        emergency_contact: patientData.emergency_contact,
        address: patientData.address
      };
    });
  }

  // ============================================================================
  // THERAPIST MANAGEMENT
  // ============================================================================

  async getTherapists(): Promise<Therapist[]> {
    const query = `
      SELECT 
        u.id, u.email, u.full_name, u.phone, u.role, u.language_preference, u.created_at, u.updated_at,
        t.specializations, t.experience_years, t.availability_start, t.availability_end, 
        t.availability_days, t.is_active
      FROM users u
      JOIN therapists t ON u.id = t.id
      WHERE u.role = 'therapist'
      ORDER BY u.created_at DESC
    `;
    const result = await this.db.query(query);
    
    return result.rows.map(row => ({
      ...row,
      availability_hours: {
        start: row.availability_start,
        end: row.availability_end,
        days: row.availability_days
      }
    })) as Therapist[];
  }

  async getTherapistById(id: string): Promise<Therapist | null> {
    const query = `
      SELECT 
        u.id, u.email, u.full_name, u.phone, u.role, u.language_preference, u.created_at, u.updated_at,
        t.specializations, t.experience_years, t.availability_start, t.availability_end, 
        t.availability_days, t.is_active
      FROM users u
      JOIN therapists t ON u.id = t.id
      WHERE u.id = $1 AND u.role = 'therapist'
    `;
    const result = await this.db.query(query, [id]);
    
    if (!result.rows[0]) return null;
    
    const row = result.rows[0];
    return {
      ...row,
      availability_hours: {
        start: row.availability_start,
        end: row.availability_end,
        days: row.availability_days
      }
    } as Therapist;
  }

  // ============================================================================
  // THERAPY MANAGEMENT
  // ============================================================================

  async getTherapyDefinitions(): Promise<TherapyDefinition[]> {
    const query = `
      SELECT id, name, type, duration_minutes, description, price, preparation_time, 
             cleanup_time, required_equipment, contraindications, created_at
      FROM therapy_definitions
      ORDER BY name
    `;
    const result = await this.db.query<TherapyDefinition>(query);
    return result.rows;
  }

  async getTherapyDefinitionById(id: string): Promise<TherapyDefinition | null> {
    const query = `
      SELECT id, name, type, duration_minutes, description, price, preparation_time, 
             cleanup_time, required_equipment, contraindications, created_at
      FROM therapy_definitions
      WHERE id = $1
    `;
    const result = await this.db.query<TherapyDefinition>(query, [id]);
    return result.rows[0] || null;
  }

  // ============================================================================
  // ROOM MANAGEMENT
  // ============================================================================

  async getRooms(): Promise<Room[]> {
    const query = `
      SELECT id, name, capacity, equipment, is_available, created_at
      FROM rooms
      ORDER BY name
    `;
    const result = await this.db.query<Room>(query);
    return result.rows;
  }

  async getRoomById(id: string): Promise<Room | null> {
    const query = `
      SELECT id, name, capacity, equipment, is_available, created_at
      FROM rooms
      WHERE id = $1
    `;
    const result = await this.db.query<Room>(query, [id]);
    return result.rows[0] || null;
  }

  // ============================================================================
  // BOOKING MANAGEMENT
  // ============================================================================

  async createBookingRequest(bookingData: Omit<BookingRequest, 'id' | 'created_at' | 'updated_at'>): Promise<BookingRequest> {
    const query = `
      INSERT INTO booking_requests (patient_id, therapy_id, preferred_therapist_id, preferred_date, preferred_time_slot, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, patient_id, therapy_id, preferred_therapist_id, preferred_date, preferred_time_slot, notes, status, created_at, updated_at
    `;
    const result = await this.db.query<BookingRequest>(query, [
      bookingData.patient_id,
      bookingData.therapy_id,
      bookingData.preferred_therapist_id,
      bookingData.preferred_date,
      bookingData.preferred_time_slot,
      bookingData.notes,
      bookingData.status || 'pending'
    ]);
    return result.rows[0];
  }

  async getBookingRequests(filters?: {
    patientId?: string;
    therapistId?: string;
    status?: BookingStatus;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<BookingRequest[]> {
    let query = `
      SELECT id, patient_id, therapy_id, preferred_therapist_id, preferred_date, 
             preferred_time_slot, notes, status, created_at, updated_at
      FROM booking_requests
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters?.patientId) {
      params.push(filters.patientId);
      query += ` AND patient_id = $${++paramCount}`;
    }

    if (filters?.therapistId) {
      params.push(filters.therapistId);
      query += ` AND preferred_therapist_id = $${++paramCount}`;
    }

    if (filters?.status) {
      params.push(filters.status);
      query += ` AND status = $${++paramCount}`;
    }

    if (filters?.dateFrom) {
      params.push(filters.dateFrom);
      query += ` AND preferred_date >= $${++paramCount}`;
    }

    if (filters?.dateTo) {
      params.push(filters.dateTo);
      query += ` AND preferred_date <= $${++paramCount}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.db.query<BookingRequest>(query, params);
    return result.rows;
  }

  async updateBookingStatus(id: string, status: BookingStatus): Promise<BookingRequest | null> {
    const query = `
      UPDATE booking_requests 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, patient_id, therapy_id, preferred_therapist_id, preferred_date, 
                preferred_time_slot, notes, status, created_at, updated_at
    `;
    const result = await this.db.query<BookingRequest>(query, [status, id]);
    return result.rows[0] || null;
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  async createTherapySession(sessionData: Omit<TherapySession, 'id' | 'created_at' | 'updated_at'>): Promise<TherapySession> {
    const query = `
      INSERT INTO therapy_sessions (booking_request_id, patient_id, therapist_id, therapy_id, room_id, 
                                   scheduled_start, scheduled_end, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, booking_request_id, patient_id, therapist_id, therapy_id, room_id, 
                scheduled_start, scheduled_end, actual_start, actual_end, status, 
                therapist_notes, patient_vitals, created_at, updated_at
    `;
    const result = await this.db.query<TherapySession>(query, [
      sessionData.booking_request_id,
      sessionData.patient_id,
      sessionData.therapist_id,
      sessionData.therapy_id,
      sessionData.room_id,
      sessionData.scheduled_start,
      sessionData.scheduled_end,
      sessionData.status || 'scheduled'
    ]);
    return result.rows[0];
  }

  async getTherapySessions(filters?: {
    patientId?: string;
    therapistId?: string;
    status?: SessionStatus;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<TherapySession[]> {
    let query = `
      SELECT id, booking_request_id, patient_id, therapist_id, therapy_id, room_id, 
             scheduled_start, scheduled_end, actual_start, actual_end, status, 
             therapist_notes, patient_vitals, created_at, updated_at
      FROM therapy_sessions
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters?.patientId) {
      params.push(filters.patientId);
      query += ` AND patient_id = $${++paramCount}`;
    }

    if (filters?.therapistId) {
      params.push(filters.therapistId);
      query += ` AND therapist_id = $${++paramCount}`;
    }

    if (filters?.status) {
      params.push(filters.status);
      query += ` AND status = $${++paramCount}`;
    }

    if (filters?.dateFrom) {
      params.push(filters.dateFrom);
      query += ` AND DATE(scheduled_start) >= $${++paramCount}`;
    }

    if (filters?.dateTo) {
      params.push(filters.dateTo);
      query += ` AND DATE(scheduled_start) <= $${++paramCount}`;
    }

    query += ` ORDER BY scheduled_start DESC`;

    const result = await this.db.query<TherapySession>(query, params);
    return result.rows;
  }

  async updateTherapySession(id: string, updates: Partial<TherapySession>): Promise<TherapySession | null> {
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    if (updates.actual_start !== undefined) {
      updateFields.push(`actual_start = $${++paramCount}`);
      params.push(updates.actual_start);
    }

    if (updates.actual_end !== undefined) {
      updateFields.push(`actual_end = $${++paramCount}`);
      params.push(updates.actual_end);
    }

    if (updates.status !== undefined) {
      updateFields.push(`status = $${++paramCount}`);
      params.push(updates.status);
    }

    if (updates.therapist_notes !== undefined) {
      updateFields.push(`therapist_notes = $${++paramCount}`);
      params.push(updates.therapist_notes);
    }

    if (updates.patient_vitals !== undefined) {
      updateFields.push(`patient_vitals = $${++paramCount}`);
      params.push(JSON.stringify(updates.patient_vitals));
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `
      UPDATE therapy_sessions 
      SET ${updateFields.join(', ')}
      WHERE id = $${++paramCount}
      RETURNING id, booking_request_id, patient_id, therapist_id, therapy_id, room_id, 
                scheduled_start, scheduled_end, actual_start, actual_end, status, 
                therapist_notes, patient_vitals, created_at, updated_at
    `;

    const result = await this.db.query<TherapySession>(query, params);
    return result.rows[0] || null;
  }

  // ============================================================================
  // MENTAL HEALTH ASSESSMENTS
  // ============================================================================

  async createMentalHealthAssessment(assessmentData: Omit<MentalHealthAssessment, 'id' | 'created_at'>): Promise<MentalHealthAssessment> {
    const query = `
      INSERT INTO mental_health_assessments (patient_id, session_id, stress_level, anxiety_level, 
                                           mood_rating, sleep_quality, energy_level, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, patient_id, session_id, stress_level, anxiety_level, mood_rating, 
                sleep_quality, energy_level, notes, assessment_date, created_at
    `;
    const result = await this.db.query<MentalHealthAssessment>(query, [
      assessmentData.patient_id,
      assessmentData.session_id,
      assessmentData.stress_level,
      assessmentData.anxiety_level,
      assessmentData.mood_rating,
      assessmentData.sleep_quality,
      assessmentData.energy_level,
      assessmentData.notes
    ]);
    return result.rows[0];
  }

  async getMentalHealthAssessments(patientId?: string): Promise<MentalHealthAssessment[]> {
    let query = `
      SELECT id, patient_id, session_id, stress_level, anxiety_level, mood_rating, 
             sleep_quality, energy_level, notes, assessment_date, created_at
      FROM mental_health_assessments
    `;
    const params: any[] = [];

    if (patientId) {
      query += ` WHERE patient_id = $1`;
      params.push(patientId);
    }

    query += ` ORDER BY assessment_date DESC`;

    const result = await this.db.query<MentalHealthAssessment>(query, params);
    return result.rows;
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  async createNotification(notificationData: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const query = `
      INSERT INTO notifications (user_id, title, message, type, is_read)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, title, message, type, is_read, created_at
    `;
    const result = await this.db.query<Notification>(query, [
      notificationData.user_id,
      notificationData.title,
      notificationData.message,
      notificationData.type || 'info',
      notificationData.is_read || false
    ]);
    return result.rows[0];
  }

  async getNotifications(userId: string, onlyUnread = false): Promise<Notification[]> {
    let query = `
      SELECT id, user_id, title, message, type, is_read, created_at
      FROM notifications
      WHERE user_id = $1
    `;
    const params = [userId];

    if (onlyUnread) {
      query += ` AND is_read = false`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.db.query<Notification>(query, params);
    return result.rows;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const query = `
      UPDATE notifications 
      SET is_read = true 
      WHERE id = $1
    `;
    const result = await this.db.query(query, [id]);
    return result.rowCount > 0;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async getAvailableTherapists(
    date: string, 
    timeSlot: string, 
    therapyType?: TherapyType
  ): Promise<Therapist[]> {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    let query = `
      SELECT 
        u.id, u.email, u.full_name, u.phone, u.role, u.language_preference, u.created_at, u.updated_at,
        t.specializations, t.experience_years, t.availability_start, t.availability_end, 
        t.availability_days, t.is_active
      FROM users u
      JOIN therapists t ON u.id = t.id
      WHERE u.role = 'therapist' 
        AND t.is_active = true
        AND $1 = ANY(t.availability_days)
        AND $2::time >= t.availability_start 
        AND $2::time <= t.availability_end
        AND u.id NOT IN (
          SELECT therapist_id 
          FROM therapy_sessions 
          WHERE DATE(scheduled_start) = $3 
            AND scheduled_start <= $4::timestamp 
            AND scheduled_end > $4::timestamp
            AND status NOT IN ('cancelled', 'no_show')
        )
    `;
    
    const params = [dayOfWeek, timeSlot, date, `${date} ${timeSlot}`];

    if (therapyType) {
      query += ` AND $5 = ANY(t.specializations)`;
      params.push(therapyType);
    }

    query += ` ORDER BY t.experience_years DESC`;

    const result = await this.db.query(query, params);
    
    return result.rows.map(row => ({
      ...row,
      availability_hours: {
        start: row.availability_start,
        end: row.availability_end,
        days: row.availability_days
      }
    })) as Therapist[];
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;
