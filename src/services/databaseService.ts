// Environment-aware database service
// For client-side applications, we'll simulate database operations
// In a real production app, this would connect to a backend API

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
  UserRole,
  BookingStatus,
  SessionStatus,
  TherapyType
} from '../types';

// Import mock data as fallback for client-side demo
import { 
  mockPatients, 
  mockTherapists, 
  mockAdmins, 
  mockTherapies, 
  mockRooms,
  mockBookingRequests,
  mockTherapySessions,
  mockAssessments,
  mockNotifications
} from './mockData';

class DatabaseServiceWrapper {
  private usePostgres: boolean = false; // Disable PostgreSQL for client-side demo

  constructor() {
    // For client-side demo, always use mock data
    // In a real app, this would connect to a REST API backend
    this.usePostgres = false;
    console.log('� Using mock data for client-side demo');
  }

  async initialize() {
    // No initialization needed for mock data
    console.log('✅ Database service initialized with mock data');
  }

  async cleanup() {
    // No cleanup needed for mock data
  }

  // Mock implementations for client-side demo
  async getAllUsers(): Promise<User[]> {
    return [...mockPatients, ...mockTherapists, ...mockAdmins];
  }

  async getUserById(id: string): Promise<User | null> {
    const allUsers = [...mockPatients, ...mockTherapists, ...mockAdmins];
    return allUsers.find(user => user.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const allUsers = [...mockPatients, ...mockTherapists, ...mockAdmins];
    return allUsers.find(user => user.email === email) || null;
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    switch (role) {
      case 'patient': return mockPatients;
      case 'therapist': return mockTherapists;
      case 'admin': return mockAdmins;
      default: return [];
    }
  }

  async getPatients(): Promise<Patient[]> {
    return mockPatients;
  }

  async getPatientById(id: string): Promise<Patient | null> {
    return mockPatients.find(p => p.id === id) || null;
  }

  async createPatient(data: any): Promise<Patient> {
    const newPatient = {
      ...data,
      id: `patient_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockPatients.push(newPatient);
    return newPatient;
  }

  async getTherapists(): Promise<Therapist[]> {
    return mockTherapists;
  }

  async getTherapistById(id: string): Promise<Therapist | null> {
    return mockTherapists.find(t => t.id === id) || null;
  }

  async getTherapyDefinitions(): Promise<TherapyDefinition[]> {
    return mockTherapies;
  }

  async getTherapyDefinitionById(id: string): Promise<TherapyDefinition | null> {
    return mockTherapies.find(t => t.id === id) || null;
  }

  async getRooms(): Promise<Room[]> {
    return mockRooms;
  }

  async getRoomById(id: string): Promise<Room | null> {
    return mockRooms.find(r => r.id === id) || null;
  }

  async createBookingRequest(data: any): Promise<BookingRequest> {
    const newBooking = {
      ...data,
      id: `booking_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockBookingRequests.push(newBooking);
    return newBooking;
  }

  async getBookingRequests(filters?: any): Promise<BookingRequest[]> {
    let filteredBookings = [...mockBookingRequests];
    
    if (filters?.patientId) {
      filteredBookings = filteredBookings.filter(b => b.patient_id === filters.patientId);
    }
    
    if (filters?.therapistId) {
      filteredBookings = filteredBookings.filter(b => b.preferred_therapist_id === filters.therapistId);
    }
    
    if (filters?.status) {
      filteredBookings = filteredBookings.filter(b => b.status === filters.status);
    }
    
    return filteredBookings;
  }

  async updateBookingStatus(id: string, status: BookingStatus): Promise<BookingRequest | null> {
    const booking = mockBookingRequests.find(b => b.id === id);
    if (booking) {
      booking.status = status;
      booking.updated_at = new Date().toISOString();
    }
    return booking || null;
  }

  async createTherapySession(data: any): Promise<TherapySession> {
    const newSession = {
      ...data,
      id: `session_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockTherapySessions.push(newSession);
    return newSession;
  }

  async getTherapySessions(filters?: any): Promise<TherapySession[]> {
    let filteredSessions = [...mockTherapySessions];
    
    if (filters?.patientId) {
      filteredSessions = filteredSessions.filter(s => s.patient_id === filters.patientId);
    }
    
    if (filters?.therapistId) {
      filteredSessions = filteredSessions.filter(s => s.therapist_id === filters.therapistId);
    }
    
    if (filters?.status) {
      filteredSessions = filteredSessions.filter(s => s.status === filters.status);
    }

    if (filters?.dateFrom) {
      filteredSessions = filteredSessions.filter(s => 
        new Date(s.scheduled_start) >= new Date(filters.dateFrom)
      );
    }
    
    if (filters?.dateTo) {
      filteredSessions = filteredSessions.filter(s => 
        new Date(s.scheduled_start) <= new Date(filters.dateTo)
      );
    }
    
    return filteredSessions;
  }

  async updateTherapySession(id: string, updates: any): Promise<TherapySession | null> {
    const session = mockTherapySessions.find(s => s.id === id);
    if (session) {
      Object.assign(session, updates);
      session.updated_at = new Date().toISOString();
    }
    return session || null;
  }

  async updateSessionStatus(id: string, status: SessionStatus): Promise<TherapySession | null> {
    return this.updateTherapySession(id, { status });
  }

  async getTherapyById(id: string): Promise<TherapyDefinition | null> {
    return this.getTherapyDefinitionById(id);
  }

  async createMentalHealthAssessment(data: any): Promise<MentalHealthAssessment> {
    const newAssessment = {
      ...data,
      id: `assessment_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    mockAssessments.push(newAssessment);
    return newAssessment;
  }

  async getMentalHealthAssessments(patientId?: string): Promise<MentalHealthAssessment[]> {
    if (patientId) {
      return mockAssessments.filter(a => a.patient_id === patientId);
    }
    return mockAssessments;
  }

  async getAssessments(patientId: string): Promise<MentalHealthAssessment[]> {
    return this.getMentalHealthAssessments(patientId);
  }

  async createNotification(data: any): Promise<Notification> {
    const newNotification = {
      ...data,
      id: `notification_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    mockNotifications.push(newNotification);
    return newNotification;
  }

  async getNotifications(userId: string, onlyUnread = false): Promise<Notification[]> {
    let filtered = mockNotifications.filter(n => n.user_id === userId);
    if (onlyUnread) {
      filtered = filtered.filter(n => !n.is_read);
    }
    return filtered;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const notification = mockNotifications.find(n => n.id === id);
    if (notification) {
      notification.is_read = true;
      return true;
    }
    return false;
  }

  async getAvailableTherapists(
    date: string, 
    timeSlot: string, 
    therapyType?: TherapyType
  ): Promise<Therapist[]> {
    // Simple availability check with mock data
    let available = [...mockTherapists];
    
    if (therapyType) {
      available = available.filter(t => 
        t.specializations.includes(therapyType)
      );
    }
    
    return available;
  }
}

// Export singleton instance
export const databaseService = new DatabaseServiceWrapper();
export default databaseService;
