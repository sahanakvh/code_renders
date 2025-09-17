import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Dummy data for demo
const THERAPISTS = [
  {
    id: 'T1',
    name: 'Dr. Alice Sharma',
    center: 'Ayurveda Wellness Center',
    city: 'Bangalore',
    specialization: 'Panchakarma',
    therapies: ['Abhyanga', 'Basti', 'Swedana'],
    slots: ['09:00-10:00', '11:00-12:00'],
  },
  {
    id: 'T2',
    name: 'Dr. Bob Menon',
    center: 'Kerala Ayur Clinic',
    city: 'Chennai',
    specialization: 'Detox',
    therapies: ['Virechana', 'Abhyanga'],
    slots: ['10:00-11:00', '14:00-15:00'],
  },
  {
    id: 'T3',
    name: 'Dr. Carol Singh',
    center: 'Healing Touch Hospital',
    city: 'Bangalore',
    specialization: 'Rejuvenation',
    therapies: ['Swedana', 'Shirodhara'],
    slots: ['13:00-14:00', '16:00-17:00'],
  },
];

const unique = (arr: string[]) => Array.from(new Set(arr));

export default function TherapistsPage() {
  const [city, setCity] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [therapy, setTherapy] = useState('');
  const [filtered, setFiltered] = useState(THERAPISTS);
  const navigate = useNavigate();

  useEffect(() => {
    setFiltered(
      THERAPISTS.filter(t =>
        (!city || t.city === city) &&
        (!specialization || t.specialization === specialization) &&
        (!therapy || t.therapies.includes(therapy))
      )
    );
  }, [city, specialization, therapy]);

  return (
    <div style={{ padding: 32 }}>
      <h2>Therapists</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <select value={city} onChange={e => setCity(e.target.value)}>
          <option value=''>All Cities</option>
          {unique(THERAPISTS.map(t => t.city)).map(c => <option key={String(c)}>{String(c)}</option>)}
        </select>
        <select value={specialization} onChange={e => setSpecialization(e.target.value)}>
          <option value=''>All Specializations</option>
          {unique(THERAPISTS.map(t => t.specialization)).map(s => <option key={String(s)}>{String(s)}</option>)}
        </select>
        <select value={therapy} onChange={e => setTherapy(e.target.value)}>
          <option value=''>All Therapies</option>
          {unique(THERAPISTS.flatMap(t => t.therapies)).map(th => <option key={String(th)}>{String(th)}</option>)}
        </select>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#e3f2fd' }}>
            <th>#</th>
            <th>Therapist Name</th>
            <th>Center</th>
            <th>City</th>
            <th>Specialization</th>
            <th>Therapies Offered</th>
            <th>Available Time Slots</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((t, idx) => (
            <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{idx + 1}</td>
              <td>{t.name}</td>
              <td>{t.center}</td>
              <td>{t.city}</td>
              <td>{t.specialization}</td>
              <td>{t.therapies.join(', ')}</td>
              <td>{t.slots.join(', ')}</td>
              <td>
                <button onClick={() => navigate('/therapist')} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600 }}>OK</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
