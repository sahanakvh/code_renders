import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin, CheckCircle, AlertCircle, Users, Activity } from 'lucide-react';
import { Therapist, TherapySession, Patient, Room, TherapyDefinition } from '@/types';
import { databaseService } from '@/services/databaseService';
import DashboardLayout from '../Layout/DashboardLayout';
import GanttChart from '../Gantt/GanttChart';

interface TherapistDashboardProps {
  therapist: Therapist;
}

const TherapistDashboard: React.FC<TherapistDashboardProps> = ({ therapist }) => {
  const [todaySessions, setTodaySessions] = useState<TherapySession[]>([]);
  const [weekSessions, setWeekSessions] = useState<TherapySession[]>([]);
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [therapist.id, currentViewDate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get today's sessions
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const todaySessionsData = await databaseService.getTherapySessions({
        therapist_id: therapist.id,
        date_range: {
          start: todayStart.toISOString(),
          end: todayEnd.toISOString()
        }
      });
      setTodaySessions(todaySessionsData);

      // Get week sessions for Gantt chart
      const weekStart = new Date(currentViewDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weekSessionsData = await databaseService.getTherapySessions({
        therapist_id: therapist.id,
        date_range: {
          start: weekStart.toISOString(),
          end: weekEnd.toISOString()
        }
      });
      setWeekSessions(weekSessionsData);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionStatusUpdate = async (sessionId: string, newStatus: any) => {
    try {
      await databaseService.updateSessionStatus(sessionId, newStatus);
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to update session status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-primary text-primary-foreground';
      case 'checked_in': return 'bg-warning text-warning-foreground';
      case 'in_progress': return 'bg-therapy text-therapy-foreground';
      case 'completed': return 'bg-success text-success-foreground';
      case 'cancelled': return 'bg-error text-error-foreground';
      case 'no_show': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getNextAction = (session: TherapySession) => {
    switch (session.status) {
      case 'scheduled':
        return { text: 'Check In', action: 'checked_in', variant: 'default' as const };
      case 'checked_in':
        return { text: 'Start Session', action: 'in_progress', variant: 'default' as const };
      case 'in_progress':
        return { text: 'Complete', action: 'completed', variant: 'default' as const };
      default:
        return null;
    }
  };

  const todayStats = {
    total: todaySessions.length,
    completed: todaySessions.filter(s => s.status === 'completed').length,
    upcoming: todaySessions.filter(s => ['scheduled', 'checked_in'].includes(s.status)).length,
    inProgress: todaySessions.filter(s => s.status === 'in_progress').length
  };

  if (loading) {
    return (
      <DashboardLayout currentUser={therapist}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentUser={therapist} notifications={2}>
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-secondary to-therapy rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Good morning, Dr. {therapist.full_name.split(' ')[1]}! 🌿
          </h1>
          <p className="text-white/90">
            You have {todayStats.upcoming} sessions scheduled for today.
          </p>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-primary-light to-white border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{todayStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-therapy-light to-white border-therapy/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-therapy/10 rounded-full">
                  <Activity className="h-6 w-6 text-therapy" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-therapy">{todayStats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning-light to-white border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-warning/10 rounded-full">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{todayStats.upcoming}</p>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success-light to-white border-success/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/10 rounded-full">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">{todayStats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaySessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sessions scheduled for today</p>
                    <p className="text-sm">Enjoy your rest day! 🧘‍♂️</p>
                  </div>
                ) : (
                  todaySessions
                    .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime())
                    .map((session) => {
                      const nextAction = getNextAction(session);
                      return (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-center min-w-[60px]">
                              <p className="text-sm font-medium">
                                {formatTime(session.scheduled_start)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(session.scheduled_end)}
                              </p>
                            </div>
                            <div className="border-l pl-4">
                              <p className="font-medium">Patient Name</p>
                              <p className="text-sm text-muted-foreground">Abhyanga Therapy</p>
                              <div className="flex items-center gap-2 mt-1">
                                <MapPin className="h-3 w-3" />
                                <span className="text-xs">Room 1</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(session.status)}>
                              {session.status.replace('_', ' ')}
                            </Badge>
                            {nextAction && (
                              <Button
                                size="sm"
                                variant={nextAction.variant}
                                onClick={() => handleSessionStatusUpdate(session.id, nextAction.action)}
                              >
                                {nextAction.text}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  View Patient Records
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Update Availability
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Session Notes
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Assessment
                </Button>
              </CardContent>
            </Card>

            {/* Recent Patients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Patients
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">John Smith</p>
                      <p className="text-xs text-muted-foreground">Last session: 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Priya Sharma</p>
                      <p className="text-xs text-muted-foreground">Last session: 1 week ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weekly Schedule Gantt Chart */}
        <GanttChart
          sessions={weekSessions}
          viewDate={currentViewDate}
          onDateChange={setCurrentViewDate}
          onSessionClick={(session) => {
            console.log('Session clicked:', session);
            // Handle session details modal or navigation
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default TherapistDashboard;