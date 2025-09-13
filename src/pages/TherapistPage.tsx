import React, { useState, useEffect } from 'react';
import TherapistDashboard from '@/components/Dashboard/TherapistDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService as db } from '@/services/databaseService';
import { mockTherapists } from '@/services/mockData';
import { Therapist } from '@/types';

const TherapistPage: React.FC = () => {
  const { user } = useAuth();
  const [currentTherapist, setCurrentTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTherapistData();
  }, [user]);

  const loadTherapistData = async () => {
    try {
      setLoading(true);
      
      if (user) {
        // Try to get therapist data from database
        try {
          const therapists = await db.getTherapists();
          const therapist = therapists.find(t => t.id === user.id);
          
          if (therapist) {
            setCurrentTherapist(therapist);
          } else {
            // Create a therapist object from user data if not found in therapists table
            const userAsTherapist: Therapist = {
              id: user.id,
              email: user.email,
              full_name: user.fullName,
              phone: user.phone,
              role: 'therapist',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              language_preference: 'English',
              specializations: ['abhyanga'],
              experience_years: 1,
              availability_hours: {
                start: '09:00',
                end: '17:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
              },
              is_active: true
            };
            setCurrentTherapist(userAsTherapist);
          }
        } catch (error) {
          console.error('Database error, using mock data:', error);
          // Fallback to mock data for demo
          setCurrentTherapist(mockTherapists[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load therapist data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentTherapist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Therapist Not Found</h2>
          <p className="text-muted-foreground">Unable to load therapist data.</p>
        </div>
      </div>
    );
  }

  return <TherapistDashboard therapist={currentTherapist} />;
};

export default TherapistPage;
