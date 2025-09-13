import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, MapPin } from 'lucide-react';
import { TherapySession, Therapist, Patient, Room, TherapyDefinition } from '@/types';
import { db } from '@/services/database';

interface GanttChartProps {
  sessions: TherapySession[];
  viewDate: Date;
  onSessionClick?: (session: TherapySession) => void;
  onDateChange?: (date: Date) => void;
}

interface GanttItem {
  session: TherapySession;
  patient: Patient | null;
  therapist: Therapist | null;
  room: Room | null;
  therapy: TherapyDefinition | null;
  position: {
    left: number;
    width: number;
    top: number;
  };
}

const GanttChart: React.FC<GanttChartProps> = ({
  sessions,
  viewDate,
  onSessionClick,
  onDateChange
}) => {
  const [ganttItems, setGanttItems] = useState<GanttItem[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);

  // Time range for display (8 AM to 8 PM)
  const startHour = 8;
  const endHour = 20;
  const totalHours = endHour - startHour;

  useEffect(() => {
    loadGanttData();
  }, [sessions, viewDate]);

  const loadGanttData = async () => {
    setLoading(true);
    try {
      // Get all therapists for the sidebar
      const allTherapists = await db.getUsersByRole('therapist') as Therapist[];
      setTherapists(allTherapists);

      // Process sessions into gantt items
      const items: GanttItem[] = [];
      
      for (const session of sessions) {
        const patient = await db.getUserById(session.patient_id) as Patient;
        const therapist = await db.getUserById(session.therapist_id) as Therapist;
        const room = await db.getUserById(session.room_id) as Room;
        const therapy = await db.getTherapyById(session.therapy_id);

        // Calculate position
        const sessionStart = new Date(session.scheduled_start);
        const sessionEnd = new Date(session.scheduled_end);
        
        const position = calculatePosition(sessionStart, sessionEnd, session.therapist_id, allTherapists);
        
        items.push({
          session,
          patient,
          therapist,
          room,
          therapy,
          position
        });
      }

      setGanttItems(items);
    } catch (error) {
      console.error('Failed to load gantt data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePosition = (
    start: Date, 
    end: Date, 
    therapistId: string, 
    allTherapists: Therapist[]
  ) => {
    // Calculate horizontal position (time-based)
    const startHours = start.getHours() + start.getMinutes() / 60;
    const endHours = end.getHours() + end.getMinutes() / 60;
    
    const left = ((startHours - startHour) / totalHours) * 100;
    const width = ((endHours - startHours) / totalHours) * 100;
    
    // Calculate vertical position (therapist-based)
    const therapistIndex = allTherapists.findIndex(t => t.id === therapistId);
    const top = therapistIndex * 80; // 80px per therapist row
    
    return { left, width, top };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-primary';
      case 'checked_in': return 'bg-warning';
      case 'in_progress': return 'bg-therapy';
      case 'completed': return 'bg-success';
      case 'cancelled': return 'bg-error';
      case 'no_show': return 'bg-muted';
      default: return 'bg-primary';
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const generateTimeLabels = () => {
    const labels = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      labels.push(
        <div 
          key={hour} 
          className="text-xs text-muted-foreground border-l border-border px-2"
          style={{ width: `${100 / totalHours}%` }}
        >
          {String(hour).padStart(2, '0')}:00
        </div>
      );
    }
    return labels;
  };

  const navigateDate = (days: number) => {
    const newDate = new Date(viewDate);
    newDate.setDate(newDate.getDate() + days);
    onDateChange?.(newDate);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schedule Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Overview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {viewDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateDate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          {/* Time header */}
          <div className="flex border-b border-border h-12 items-end pb-2">
            <div className="w-40 flex-shrink-0"></div>
            <div className="flex-1 flex">
              {generateTimeLabels()}
            </div>
          </div>

          {/* Gantt content */}
          <div className="relative" style={{ height: therapists.length * 80 + 'px' }}>
            {/* Therapist rows */}
            {therapists.map((therapist, index) => (
              <div
                key={therapist.id}
                className="flex items-center border-b border-border"
                style={{ 
                  height: '80px',
                  position: 'absolute',
                  top: index * 80,
                  left: 0,
                  right: 0
                }}
              >
                {/* Therapist info */}
                <div className="w-40 flex-shrink-0 px-3 py-2">
                  <div className="text-sm font-medium truncate">{therapist.full_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {therapist.specializations.slice(0, 2).join(', ')}
                  </div>
                </div>

                {/* Time grid */}
                <div className="flex-1 relative h-full">
                  {/* Hour markers */}
                  {Array.from({ length: totalHours }, (_, i) => (
                    <div
                      key={i}
                      className="absolute border-l border-border opacity-30"
                      style={{
                        left: `${(i / totalHours) * 100}%`,
                        height: '100%'
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Session blocks */}
            {ganttItems.map((item) => (
              <div
                key={item.session.id}
                className={`absolute rounded-lg p-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-medium ${getStatusColor(item.session.status)}`}
                style={{
                  left: `calc(160px + ${item.position.left}%)`,
                  width: `${item.position.width}%`,
                  top: item.position.top + 10,
                  height: '60px'
                }}
                onClick={() => onSessionClick?.(item.session)}
              >
                <div className="text-white text-xs font-medium truncate">
                  {item.patient?.full_name}
                </div>
                <div className="text-white/90 text-xs truncate">
                  {item.therapy?.name}
                </div>
                <div className="text-white/80 text-xs flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(item.session.scheduled_start)} - {formatTime(item.session.scheduled_end)}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary"></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-warning"></div>
              <span>Checked In</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-therapy"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-success"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-error"></div>
              <span>Cancelled</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GanttChart;