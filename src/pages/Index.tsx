// AyurSutra: Panchakarma Patient Management & Therapy Scheduling Software
// Production-grade MedTech web + mobile system with role-based dashboards

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Leaf, User, Calendar, Shield, Star, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
import PatientDashboard from '@/components/Dashboard/PatientDashboard';
import TherapistDashboard from '@/components/Dashboard/TherapistDashboard';
import { db } from '@/services/database';
import { mockPatients, mockTherapists } from '@/services/mockData';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedDemo, setSelectedDemo] = useState<'patient' | 'therapist' | null>(null);
  const [loading, setLoading] = useState(false);

  // Demo user login
  const loginAsDemo = async (role: 'patient' | 'therapist') => {
    setLoading(true);
    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (role === 'patient') {
        setCurrentUser(mockPatients[0]);
      } else {
        setCurrentUser(mockTherapists[0]);
      }
      setSelectedDemo(role);
    } catch (error) {
      console.error('Demo login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // If user is logged in, show their dashboard
  if (currentUser && selectedDemo) {
    if (selectedDemo === 'patient') {
      return <PatientDashboard patient={currentUser} />;
    } else {
      return <TherapistDashboard therapist={currentUser} />;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-therapy">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center text-white space-y-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-full">
                <Leaf className="h-8 w-8" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold">AyurSutra</h1>
            </div>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Advanced Panchakarma Patient Management & Therapy Scheduling Software
            </p>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Production-grade MedTech platform with AI-powered scheduling, real-time updates, 
              and comprehensive patient care management for Ayurvedic wellness centers.
            </p>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-4xl mx-auto">
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold">Smart Scheduling</h3>
                  <p className="text-sm text-white/80">Airline-inspired slot allocation with conflict prevention</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-4 text-center">
                  <Heart className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold">Patient Care</h3>
                  <p className="text-sm text-white/80">Mental health assessments & personalized therapy plans</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold">Secure & Compliant</h3>
                  <p className="text-sm text-white/80">HIPAA-compliant with role-based access control</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Access Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Experience the Platform</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore AyurSutra with our interactive demo. See how different user roles experience 
              the platform's powerful features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Patient Demo */}
            <Card className="hover:shadow-medium transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Patient Portal</CardTitle>
                <p className="text-muted-foreground">
                  Book therapies, view schedules, and track wellness progress
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-success" />
                    <span>Session booking & management</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-success" />
                    <span>Mental health assessments</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-success" />
                    <span>Personalized wellness tracking</span>
                  </div>
                </div>
                <Button 
                  className="w-full group-hover:bg-primary-hover transition-colors"
                  onClick={() => loginAsDemo('patient')}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <User className="h-4 w-4 mr-2" />
                  )}
                  Try Patient Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Therapist Demo */}
            <Card className="hover:shadow-medium transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Leaf className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-xl">Therapist Dashboard</CardTitle>
                <p className="text-muted-foreground">
                  Manage schedules, patient records, and therapy sessions
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-success" />
                    <span>Interactive Gantt schedule view</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-success" />
                    <span>Patient management & notes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-success" />
                    <span>Real-time session updates</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-secondary hover:bg-secondary-hover text-secondary-foreground"
                  onClick={() => loginAsDemo('therapist')}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Leaf className="h-4 w-4 mr-2" />
                  )}
                  Try Therapist Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Technical Features */}
          <div className="mt-16 bg-card rounded-xl p-8 border">
            <h3 className="text-2xl font-bold text-center mb-8">Technical Excellence</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Advanced Algorithms</h4>
                <p className="text-sm text-muted-foreground">
                  Airline slot scheduling, bipartite matching, and distributed locking for conflict-free booking
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-therapy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-therapy" />
                </div>
                <h4 className="font-semibold mb-2">Real-time Updates</h4>
                <p className="text-sm text-muted-foreground">
                  WebSocket-powered live schedule updates and instant notifications across all users
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-success" />
                </div>
                <h4 className="font-semibold mb-2">Mental Health Integration</h4>
                <p className="text-sm text-muted-foreground">
                  PHQ-9, GAD-7, and GHQ assessments with progress tracking and therapy customization
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">AyurSutra</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Production-grade Panchakarma Patient Management System
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contact@ayursutra.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91-800-AYUR-CARE</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t text-xs text-muted-foreground">
              <p>© 2024 AyurSutra. Built for SIH 2025 - Problem Statement 25023</p>
              <p className="mt-1">
                <Badge variant="outline" className="mr-2">React + TypeScript</Badge>
                <Badge variant="outline" className="mr-2">PostgreSQL Ready</Badge>
                <Badge variant="outline" className="mr-2">Real-time</Badge>
                <Badge variant="outline">HIPAA Compliant</Badge>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
