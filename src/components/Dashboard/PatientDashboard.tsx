import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin, Plus, Heart, Brain, Activity } from 'lucide-react';
import { Patient, TherapySession, BookingRequest, MentalHealthAssessment } from '@/types';
import { databaseService as db } from '@/services/databaseService';
import DashboardLayout from '../Layout/DashboardLayout';

interface PatientDashboardProps {
  patient: Patient;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ patient }) => {
  const [upcomingSessions, setUpcomingSessions] = useState<TherapySession[]>([]);
  const [recentBookings, setRecentBookings] = useState<BookingRequest[]>([]);
  const [assessments, setAssessments] = useState<MentalHealthAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [patient.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load upcoming sessions
      const sessions = await db.getTherapySessions({ 
        patient_id: patient.id,
        date_range: {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Next 30 days
        }
      });
      setUpcomingSessions(sessions.slice(0, 3)); // Show next 3 sessions

      // Load recent booking requests
      const bookings = await db.getBookingRequests({ patient_id: patient.id });
      setRecentBookings(bookings.slice(0, 5));

      // Load mental health assessments
      const patientAssessments = await db.getAssessments(patient.id);
      setAssessments(patientAssessments.slice(0, 3));

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': case 'scheduled': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'cancelled': return 'bg-error text-error-foreground';
      case 'completed': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'mild': return 'bg-success text-success-foreground';
      case 'moderate': return 'bg-warning text-warning-foreground';
      case 'severe': return 'bg-error text-error-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <DashboardLayout currentUser={patient}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentUser={patient} notifications={3}>
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {patient.full_name.split(' ')[0]}! 🧘‍♂️
          </h1>
          <p className="text-white/90">
            Your wellness journey continues. Here's your health overview.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-therapy-light to-white border-therapy/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-therapy/10 rounded-full">
                  <Calendar className="h-6 w-6 text-therapy" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-therapy">
                    {upcomingSessions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success-light to-white border-success/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/10 rounded-full">
                  <Activity className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">
                    {recentBookings.filter(b => b.status === 'completed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed Therapies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary-light to-white border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {assessments.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Health Assessments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Sessions
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Book Session
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming sessions</p>
                  <p className="text-sm">Book a session to start your wellness journey</p>
                </div>
              ) : (
                upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Heart className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Abhyanga Massage</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(session.scheduled_start)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(session.scheduled_start)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">Therapy Request</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(booking.created_at)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mental Health Assessments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Mental Health Assessments
            </CardTitle>
            <Button size="sm" variant="outline">
              Take Assessment
            </Button>
          </CardHeader>
          <CardContent>
            {assessments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No assessments completed yet</p>
                <p className="text-sm">Regular assessments help track your mental wellness</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Wellness Assessment</h4>
                      <Badge className="bg-blue-100 text-blue-800">
                        Score: {Math.round((assessment.stress_level + assessment.anxiety_level + assessment.mood_rating + assessment.sleep_quality + assessment.energy_level) / 5)}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>Stress: {assessment.stress_level}/10</p>
                      <p>Anxiety: {assessment.anxiety_level}/10</p>
                      <p>Mood: {assessment.mood_rating}/10</p>
                      <p>Sleep: {assessment.sleep_quality}/10</p>
                      <p>Energy: {assessment.energy_level}/10</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(assessment.assessment_date)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;