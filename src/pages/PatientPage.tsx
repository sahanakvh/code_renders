import React, { useState, useEffect } from 'react';
import PatientDashboard from '@/components/Dashboard/PatientDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService as db } from '@/services/databaseService';
import { mockPatients } from '@/services/mockData';
import { Patient } from '@/types';

const PatientPage: React.FC = () => {
  const { user } = useAuth();
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, [user]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      if (user) {
        // Try to get patient data from database
        try {
          const patients = await db.getPatients();
          const patient = patients.find(p => p.id === user.id);
          
          if (patient) {
            setCurrentPatient(patient);
          } else {
            // Create a patient object from user data if not found in patients table
            const userAsPatient: Patient = {
              id: user.id,
              email: user.email,
              full_name: user.fullName,
              phone: user.phone,
              role: 'patient',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              language_preference: 'English',
              date_of_birth: null,
              gender: null,
              medical_history: null,
              emergency_contact: null,
              address: null
            };
            setCurrentPatient(userAsPatient);
          }
        } catch (error) {
          console.error('Database error, using mock data:', error);
          // Fallback to mock data for demo
          setCurrentPatient(mockPatients[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load patient data:', error);
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

  if (!currentPatient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Patient Not Found</h2>
          <p className="text-muted-foreground">Unable to load patient data.</p>
        </div>
      </div>
    );
  }

  return <PatientDashboard patient={currentPatient} />;
};

export default PatientPage;
