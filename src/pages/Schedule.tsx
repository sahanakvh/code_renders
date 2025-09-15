// client/src/App.tsx
import React, { useEffect, useState, useCallback } from "react";

const API_URL = "http://localhost:4000/api";

// --- Helper Components ---
const StatusMessage = ({ status }: { status: { msg: string, type: 'success' | 'error' } | null }) => {
  if (!status || !status.msg) return null;
  const style = {
    padding: '10px 15px', margin: '15px 0', borderRadius: '5px',
    color: 'white', background: status.type === 'success' ? '#28a745' : '#dc3545'
  };
  return <div style={style}>{status.msg}</div>;
};

export default function Schedule() {
  const [date, setDate] = useState(new Date("2025-09-15").toISOString().slice(0, 10)); // default seed date
  const [appointments, setAppointments] = useState<any[]>([]);
  const [freeWindows, setFreeWindows] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [form, setForm] = useState({
    patient_id: 'P_NEW',
    therapy: 'Abhyanga',
    window_start: '09:00',
    window_end: '12:00'
  });
  const [candidates, setCandidates] = useState<any[]>([]);
  const [status, setStatus] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form to default state
  const resetForm = () => {
    setForm({
      patient_id: 'P_NEW',
      therapy: 'Abhyanga',
      window_start: '09:00',
      window_end: '12:00'
    });
    setCandidates([]);
  };

  // Fetch board
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setStatus(null);
    try {
      const resSlots = await fetch(`${API_URL}/appointments/slots?date=${date}`);
      const slotsData = await resSlots.json();

      if (Array.isArray(slotsData)) setAppointments(slotsData);
      else if (Array.isArray(slotsData.appointments)) setAppointments(slotsData.appointments);
      else setAppointments([]);

      if (Array.isArray(slotsData.free)) setFreeWindows(slotsData.free);
      else setFreeWindows([]);

      const resW = await fetch(`${API_URL}/appointments/waitlist`);
      const wdata = await resW.json();
      setWaitlist(wdata.waitlist || []);
    } catch {
      setStatus({ msg: "Failed to load board data", type: 'error' });
    }
    setIsLoading(false);
  }, [date]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // Preview candidate slots
  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setCandidates([]);
    setStatus(null);

    const body = {
      id: `REQ_${Date.now()}`,
      patient_id: form.patient_id,
      therapy: form.therapy,
      preferred_date: date,
      window_start: form.window_start,
      window_end: form.window_end,
      priority: 5
    };

    try {
      const res = await fetch(`${API_URL}/appointments/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setCandidates(data.candidates || []);
      if (!data.candidates || data.candidates.length === 0) {
        setStatus({ msg: "No immediate slots found. You can join the waitlist.", type: 'error' });
      }
    } catch {
      setStatus({ msg: "Preview failed. Try again.", type: 'error' });
    }
    setIsLoading(false);
  };

  // Confirm booking
  const handleConfirm = async (candidate: any) => {
    setIsLoading(true);
    setStatus(null);
    const body = { ...candidate, id: `APP_${Date.now()}`, patient_id: form.patient_id, therapy: form.therapy };

    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ msg: data.type === "BOOKED" ? "✅ Appointment booked successfully." : "⚠️ Added to waitlist.", type: 'success' });
        fetchData();
        resetForm(); // 🔥 reset after booking
      } else {
        setStatus({ msg: data.error || "Booking failed", type: 'error' });
      }
    } catch {
      setStatus({ msg: "Booking failed, try again.", type: 'error' });
    }
    setIsLoading(false);
  };

  // Join waitlist explicitly
  const handleWaitlist = async () => {
    setIsLoading(true);
    const body = { ...form, id: `WL_${Date.now()}`, preferred_date: date, priority: 5 };

    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ msg: `Added to waitlist (pos: ${data.waitlist_position || "n/a"}).`, type: 'success' });
        fetchData();
        resetForm(); // 🔥 reset after waitlist
      } else {
        setStatus({ msg: data.error || "Failed to join waitlist", type: 'error' });
      }
    } catch {
      setStatus({ msg: "Failed to join waitlist", type: 'error' });
    }
    setIsLoading(false);
  };

  // Cancel appointment
  const handleCancel = async (appointment_id: string) => {
    if (!window.confirm("Are you sure?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/appointments/cancel`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appointment_id })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ msg: data.auto_booked ? `Cancelled. Auto-assigned to ${data.auto_booked.patient_id}.` : "Cancelled. Slot now free.", type: 'success' });
        fetchData();
        resetForm(); // 🔥 reset after cancel
      } else {
        setStatus({ msg: data.error || "Cancel failed", type: 'error' });
      }
    } catch {
      setStatus({ msg: "Cancel failed", type: 'error' });
    }
    setIsLoading(false);
  };

  const toTime = (ts: string) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: 'auto' }}>
      <h1>🌿 AyurSutra ATC Scheduler</h1>
      <StatusMessage status={status} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div>
          {/* Booking Form */}
          <form onSubmit={handlePreview} style={{ background: '#0f1b2d', padding: 16, borderRadius: 8, border: '1px solid #213754' }}>
            <h3>Book an Appointment</h3>
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 12 }} />
            <label>Patient ID</label>
            <input name="patient_id" value={form.patient_id} onChange={handleFormChange} style={{ width: '100%', padding: 8, marginBottom: 12 }}/>
            <label>Therapy</label>
            <select name="therapy" value={form.therapy} onChange={handleFormChange} style={{ width: '100%', padding: 8, marginBottom: 12 }}>
              <option>Abhyanga</option><option>Swedana</option><option>Basti</option><option>Virechana</option>
            </select>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input name="window_start" type="time" value={form.window_start} onChange={handleFormChange} style={{ flex: 1, padding: 8 }} />
              <input name="window_end" type="time" value={form.window_end} onChange={handleFormChange} style={{ flex: 1, padding: 8 }} />
            </div>
            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: 12 }}>{isLoading ? 'Loading...' : '1. Preview Slots'}</button>
          </form>

          {/* Candidates */}
          <div style={{ marginTop: '1rem' }}>
            {candidates.length > 0 && <h4>2. Select a Slot</h4>}
            {candidates.map((c, i) => (
              <div key={i} style={{ background: '#16324a', padding: 12, marginBottom: 8, borderRadius: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span>{toTime(c.start_ts)} - {toTime(c.end_ts)} • Therapist {c.therapist_id}</span>
                <button onClick={() => handleConfirm(c)} disabled={isLoading}>Confirm</button>
              </div>
            ))}
            {candidates.length === 0 && status?.msg?.includes('waitlist') && (
              <button onClick={handleWaitlist} disabled={isLoading} style={{ width: '100%', padding: 12, background: '#ffc107', color: 'black' }}>2. Join Waitlist</button>
            )}
          </div>
        </div>

        <div>
          <h3>Appointments for {date}</h3>
          {appointments.map(a => (
            <div key={a.id} style={{ background: '#402c2c', padding: 12, marginBottom: 8, borderRadius: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span><b>{a.therapy}</b> {a.patient_id} ({toTime(a.start_ts)}) with {a.therapist_id}</span>
              <button onClick={() => handleCancel(a.id)} style={{ background: '#6c757d', color: 'white' }}>Cancel</button>
            </div>
          ))}
          <h3 style={{ marginTop: '2rem' }}>Waitlist</h3>
          {waitlist.map((w:any) => (
            <div key={w.id} style={{ background: '#16324a', padding: 12, marginBottom: 8, borderRadius: 4 }}>
              <b>{w.patient_id}</b> for {w.therapy} ({w.window_start}–{w.window_end})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}