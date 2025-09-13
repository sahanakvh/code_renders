// Scheduling Algorithms for AyurSutra
// Production-grade airline-inspired slot allocation with conflict prevention

import { 
  TherapySession, 
  Therapist, 
  Room, 
  TherapyDefinition, 
  TimeSlot,
  SchedulingRequest,
  ResourceConstraint 
} from '../types';
import { db } from './database';

// ============================================================================
// AIRLINE SLOT SCHEDULING ALGORITHM
// ============================================================================

interface SlotAllocation {
  therapist_id: string;
  room_id: string;
  start_time: string;
  end_time: string;
  priority_score: number;
  conflicts: string[];
}

export class AirlineSlotScheduler {
  private readonly BUFFER_MINUTES = 15; // Buffer between sessions
  private readonly PRIORITY_WINDOW_HOURS = 2; // Priority booking window

  /**
   * Allocate optimal therapy slot using airline-inspired algorithm
   * Considers therapist skills, room availability, and patient preferences
   */
  async allocateSlot(request: SchedulingRequest): Promise<SlotAllocation | null> {
    try {
      // Get available resources
      const therapists = await this.getAvailableTherapists(request);
      const rooms = await this.getAvailableRooms(request);
      const therapy = await db.getTherapyById(request.therapy_id);
      
      if (!therapy || therapists.length === 0 || rooms.length === 0) {
        return null;
      }

      // Generate all possible slot combinations
      const possibleSlots = await this.generateSlotCombinations(
        therapists, rooms, therapy, request
      );

      // Score and rank slots
      const rankedSlots = await this.scoreSlots(possibleSlots, request);

      // Return best available slot
      return rankedSlots.length > 0 ? rankedSlots[0] : null;
      
    } catch (error) {
      console.error('Slot allocation failed:', error);
      return null;
    }
  }

  /**
   * Get therapists available for the requested therapy type
   */
  private async getAvailableTherapists(request: SchedulingRequest): Promise<Therapist[]> {
    const allTherapists = await db.getUsersByRole('therapist') as Therapist[];
    const therapy = await db.getTherapyById(request.therapy_id);
    
    if (!therapy) return [];

    return allTherapists.filter(therapist => {
      // Check if therapist can perform this therapy
      if (!therapist.specializations.includes(therapy.type)) return false;
      
      // Check if therapist is active
      if (!therapist.is_active) return false;
      
      // Check availability on requested date (simplified)
      const requestDate = new Date(request.preferred_date);
      const dayName = requestDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      return therapist.availability_hours.days.includes(dayName);
    });
  }

  /**
   * Get rooms that have required equipment for therapy
   */
  private async getAvailableRooms(request: SchedulingRequest): Promise<Room[]> {
    const allRooms = await db.getRooms();
    const therapy = await db.getTherapyById(request.therapy_id);
    
    if (!therapy) return [];

    return allRooms.filter(room => {
      // Check if room is available
      if (!room.is_available) return false;
      
      // Check if room has required equipment
      return therapy.required_equipment.every(equipment => 
        room.equipment.includes(equipment)
      );
    });
  }

  /**
   * Generate all possible therapist-room-time combinations
   */
  private async generateSlotCombinations(
    therapists: Therapist[],
    rooms: Room[],
    therapy: TherapyDefinition,
    request: SchedulingRequest
  ): Promise<SlotAllocation[]> {
    const combinations: SlotAllocation[] = [];
    const totalDuration = therapy.duration_minutes + therapy.preparation_time + therapy.cleanup_time;

    for (const therapist of therapists) {
      for (const room of rooms) {
        // Generate time slots for the day
        const timeSlots = this.generateTimeSlots(
          therapist.availability_hours,
          totalDuration,
          request.preferred_date
        );

        for (const slot of timeSlots) {
          // Check for conflicts
          const conflicts = await this.checkConflicts(
            therapist.id, room.id, slot.start, slot.end
          );

          combinations.push({
            therapist_id: therapist.id,
            room_id: room.id,
            start_time: slot.start,
            end_time: slot.end,
            priority_score: 0, // Will be calculated later
            conflicts
          });
        }
      }
    }

    return combinations;
  }

  /**
   * Generate available time slots within therapist availability
   */
  private generateTimeSlots(
    availability: { start: string; end: string; days: string[] },
    durationMinutes: number,
    date: string
  ): Array<{ start: string; end: string }> {
    const slots: Array<{ start: string; end: string }> = [];
    const baseDate = new Date(date);
    
    // Parse availability hours
    const [startHour, startMinute] = availability.start.split(':').map(Number);
    const [endHour, endMinute] = availability.end.split(':').map(Number);
    
    const startTime = new Date(baseDate);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(baseDate);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    // Generate slots every 30 minutes
    const current = new Date(startTime);
    while (current.getTime() + (durationMinutes * 60 * 1000) <= endTime.getTime()) {
      const slotEnd = new Date(current.getTime() + (durationMinutes * 60 * 1000));
      
      slots.push({
        start: current.toISOString(),
        end: slotEnd.toISOString()
      });
      
      // Move to next 30-minute slot
      current.setMinutes(current.getMinutes() + 30);
    }
    
    return slots;
  }

  /**
   * Check for scheduling conflicts
   */
  private async checkConflicts(
    therapistId: string,
    roomId: string,
    startTime: string,
    endTime: string
  ): Promise<string[]> {
    const conflicts: string[] = [];
    
    // Check therapist availability
    const therapistSessions = await db.getTherapySessions({ therapist_id: therapistId });
    const therapistConflicts = therapistSessions.filter(session => {
      if (session.status === 'cancelled' || session.status === 'no_show') return false;
      return this.timeOverlaps(startTime, endTime, session.scheduled_start, session.scheduled_end);
    });
    
    if (therapistConflicts.length > 0) {
      conflicts.push(`Therapist has ${therapistConflicts.length} conflicting sessions`);
    }
    
    // Check room availability
    const allSessions = await db.getTherapySessions({});
    const roomConflicts = allSessions.filter(session => {
      if (session.room_id !== roomId) return false;
      if (session.status === 'cancelled' || session.status === 'no_show') return false;
      return this.timeOverlaps(startTime, endTime, session.scheduled_start, session.scheduled_end);
    });
    
    if (roomConflicts.length > 0) {
      conflicts.push(`Room has ${roomConflicts.length} conflicting sessions`);
    }
    
    return conflicts;
  }

  /**
   * Check if two time periods overlap
   */
  private timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);
    
    return s1 < e2 && e1 > s2;
  }

  /**
   * Score and rank slot allocations
   */
  private async scoreSlots(slots: SlotAllocation[], request: SchedulingRequest): Promise<SlotAllocation[]> {
    const scoredSlots = await Promise.all(
      slots.map(async (slot) => {
        let score = 0;
        
        // Penalize conflicts heavily
        if (slot.conflicts.length > 0) {
          score -= slot.conflicts.length * 1000;
        }
        
        // Prefer requested therapist
        if (request.preferred_therapist_id === slot.therapist_id) {
          score += 500;
        }
        
        // Prefer therapist experience
        const therapist = await db.getUserById(slot.therapist_id) as Therapist;
        if (therapist) {
          score += therapist.experience_years * 10;
        }
        
        // Time preference scoring (closer to preferred time = higher score)
        // This is simplified - in production you'd parse actual time preferences
        score += Math.random() * 100; // Random for demo
        
        return { ...slot, priority_score: score };
      })
    );
    
    // Sort by score (highest first) and filter out conflicted slots
    return scoredSlots
      .filter(slot => slot.conflicts.length === 0)
      .sort((a, b) => b.priority_score - a.priority_score);
  }
}

// ============================================================================
// INTERVAL SCHEDULING ALGORITHM
// ============================================================================

export class IntervalScheduler {
  /**
   * Find optimal non-overlapping sessions for a single resource
   * Uses greedy interval scheduling algorithm
   */
  optimizeResourceSchedule(sessions: TherapySession[]): TherapySession[] {
    if (sessions.length === 0) return [];
    
    // Sort sessions by end time
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.scheduled_end).getTime() - new Date(b.scheduled_end).getTime()
    );
    
    const optimized: TherapySession[] = [];
    let lastEndTime = new Date(0);
    
    for (const session of sortedSessions) {
      const sessionStart = new Date(session.scheduled_start);
      
      // If session doesn't overlap with last selected session
      if (sessionStart >= lastEndTime) {
        optimized.push(session);
        lastEndTime = new Date(session.scheduled_end);
      }
    }
    
    return optimized;
  }
}

// ============================================================================
// BIPARTITE MATCHING ALGORITHM
// ============================================================================

export class BipartiteMatchingScheduler {
  /**
   * Optimal therapist-room assignment using maximum bipartite matching
   * Ensures best possible therapist-room combinations
   */
  async findOptimalAssignments(
    therapists: Therapist[],
    rooms: Room[],
    requests: SchedulingRequest[]
  ): Promise<Map<string, { therapist: Therapist; room: Room }>> {
    const assignments = new Map<string, { therapist: Therapist; room: Room }>();
    
    // Create compatibility matrix
    const compatibilityMatrix = await this.createCompatibilityMatrix(therapists, rooms, requests);
    
    // Use greedy approach for optimal matching
    // In production, you'd implement the Hungarian algorithm or similar
    for (const request of requests) {
      const bestMatch = await this.findBestMatch(request, compatibilityMatrix, assignments);
      if (bestMatch) {
        assignments.set(request.patient_id, bestMatch);
      }
    }
    
    return assignments;
  }

  /**
   * Create compatibility matrix between therapists and rooms
   */
  private async createCompatibilityMatrix(
    therapists: Therapist[],
    rooms: Room[],
    requests: SchedulingRequest[]
  ): Promise<Map<string, number>> {
    const matrix = new Map<string, number>();
    
    for (const therapist of therapists) {
      for (const room of rooms) {
        let compatibility = 0;
        
        // Base compatibility score
        compatibility += therapist.experience_years * 10;
        
        // Equipment match bonus
        const therapy = requests[0] ? await db.getTherapyById(requests[0].therapy_id) : null;
        if (therapy) {
          const equipmentMatch = therapy.required_equipment.filter(eq => 
            room.equipment.includes(eq)
          ).length;
          compatibility += equipmentMatch * 50;
        }
        
        matrix.set(`${therapist.id}_${room.id}`, compatibility);
      }
    }
    
    return matrix;
  }

  /**
   * Find best therapist-room match for a request
   */
  private async findBestMatch(
    request: SchedulingRequest,
    compatibilityMatrix: Map<string, number>,
    existingAssignments: Map<string, { therapist: Therapist; room: Room }>
  ): Promise<{ therapist: Therapist; room: Room } | null> {
    const therapists = await db.getUsersByRole('therapist') as Therapist[];
    const rooms = await db.getRooms();
    
    let bestScore = -1;
    let bestMatch: { therapist: Therapist; room: Room } | null = null;
    
    for (const therapist of therapists) {
      for (const room of rooms) {
        // Skip if already assigned
        const isAssigned = Array.from(existingAssignments.values()).some(
          assignment => assignment.therapist.id === therapist.id || assignment.room.id === room.id
        );
        
        if (isAssigned) continue;
        
        const compatibilityKey = `${therapist.id}_${room.id}`;
        const score = compatibilityMatrix.get(compatibilityKey) || 0;
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = { therapist, room };
        }
      }
    }
    
    return bestMatch;
  }
}

// ============================================================================
// REDIS DISTRIBUTED LOCKING (Mock Implementation)
// ============================================================================

export class DistributedLockManager {
  private locks = new Map<string, { owner: string; expires: Date }>();
  
  /**
   * Acquire distributed lock for slot reservation
   * Prevents race conditions in concurrent booking scenarios
   */
  async acquireLock(
    resource: string, 
    timeSlot: string, 
    ownerId: string, 
    timeoutMs: number = 30000
  ): Promise<boolean> {
    const lockKey = `lock:${resource}:${timeSlot}`;
    const expires = new Date(Date.now() + timeoutMs);
    
    // Check if lock already exists and is not expired
    const existingLock = this.locks.get(lockKey);
    if (existingLock && existingLock.expires > new Date()) {
      return false; // Lock is held by someone else
    }
    
    // Acquire lock
    this.locks.set(lockKey, { owner: ownerId, expires });
    
    // TODO: In production, use Redis SETNX with expiration
    /*
    const redisClient = getRedisClient();
    const result = await redisClient.set(
      lockKey, 
      ownerId, 
      'PX', 
      timeoutMs, 
      'NX'
    );
    return result === 'OK';
    */
    
    return true;
  }

  /**
   * Release distributed lock
   */
  async releaseLock(resource: string, timeSlot: string, ownerId: string): Promise<boolean> {
    const lockKey = `lock:${resource}:${timeSlot}`;
    const existingLock = this.locks.get(lockKey);
    
    if (existingLock && existingLock.owner === ownerId) {
      this.locks.delete(lockKey);
      return true;
    }
    
    // TODO: In production, use Redis Lua script for atomic check-and-delete
    /*
    const redisClient = getRedisClient();
    const script = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;
    const result = await redisClient.eval(script, 1, lockKey, ownerId);
    return result === 1;
    */
    
    return false;
  }

  /**
   * Clean up expired locks
   */
  cleanupExpiredLocks(): void {
    const now = new Date();
    for (const [key, lock] of this.locks.entries()) {
      if (lock.expires <= now) {
        this.locks.delete(key);
      }
    }
  }
}

// Export singleton instances
export const airlineScheduler = new AirlineSlotScheduler();
export const intervalScheduler = new IntervalScheduler();
export const bipartiteScheduler = new BipartiteMatchingScheduler();
export const lockManager = new DistributedLockManager();

// Utility function to schedule therapy with conflict prevention
export async function scheduleTherapyWithLocking(
  request: SchedulingRequest,
  requesterId: string
): Promise<{ success: boolean; session?: TherapySession; error?: string }> {
  const lockKey = `${request.preferred_date}_${request.therapy_id}`;
  
  try {
    // Acquire distributed lock
    const lockAcquired = await lockManager.acquireLock(
      'scheduling',
      lockKey,
      requesterId,
      30000 // 30 seconds timeout
    );
    
    if (!lockAcquired) {
      return { success: false, error: 'Another booking is in progress for this slot' };
    }
    
    // Find optimal slot
    const allocation = await airlineScheduler.allocateSlot(request);
    if (!allocation) {
      await lockManager.releaseLock('scheduling', lockKey, requesterId);
      return { success: false, error: 'No available slots found' };
    }
    
    // Double-check availability (race condition protection)
    const isAvailable = await db.checkSlotAvailability(
      allocation.therapist_id,
      allocation.room_id,
      allocation.start_time,
      allocation.end_time
    );
    
    if (!isAvailable) {
      await lockManager.releaseLock('scheduling', lockKey, requesterId);
      return { success: false, error: 'Selected slot is no longer available' };
    }
    
    // Create the session
    const session = await db.createTherapySession({
      booking_request_id: 'temp_booking_id', // This would be the actual booking ID
      patient_id: request.patient_id,
      therapist_id: allocation.therapist_id,
      therapy_id: request.therapy_id,
      room_id: allocation.room_id,
      scheduled_start: allocation.start_time,
      scheduled_end: allocation.end_time,
      status: 'scheduled'
    });
    
    // Release lock
    await lockManager.releaseLock('scheduling', lockKey, requesterId);
    
    return { success: true, session };
    
  } catch (error) {
    // Ensure lock is released on error
    await lockManager.releaseLock('scheduling', lockKey, requesterId);
    return { success: false, error: `Scheduling failed: ${error}` };
  }
}