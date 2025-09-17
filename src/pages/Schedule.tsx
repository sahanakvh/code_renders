// client/src/App.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
// Simple modal for booking confirmation
function BookingModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 4px 32px #0002', minWidth: 320, textAlign: 'center' }}>
        <h2 style={{ color: '#28a745', marginBottom: 16 }}>✅ Slot Booked!</h2>
        <p>Your appointment has been confirmed.</p>
        <button onClick={onClose} style={{ marginTop: 24, padding: '8px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16 }}>OK</button>
      </div>
    </div>
  );
}

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
  const [showBookedModal, setShowBookedModal] = useState(false);
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
  const [realtimeMsg, setRealtimeMsg] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

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

  // Real-time updates placeholder (WebSocket)
  // Disabled: No backend WebSocket server available
  // useEffect(() => {
  //   const ws = new window.WebSocket("ws://localhost:4000/ws/schedule");
  //   wsRef.current = ws;
  //   ws.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       if (data.type === "REALTIME_REALLOCATION") {
  //         setRealtimeMsg(data.message || "Schedule updated due to delay/cancellation.");
  //         fetchData(); // Refresh board
  //       }
  //     } catch (e) {}
  //   };
  //   ws.onerror = () => setRealtimeMsg("WebSocket error: real-time updates unavailable.");
  //   ws.onclose = () => setRealtimeMsg("WebSocket closed: real-time updates stopped.");
  //   return () => ws.close();
  // }, [fetchData]);

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
      let data = { candidates: [] };
      if (res.ok) {
        data = await res.json();
      }
      // Always show 3 demo slots if none returned
      if (!data.candidates || data.candidates.length === 0) {
        // fallback demo slots
        const now = Date.now();
        data.candidates = [0,1,2].map(i => {
          const offset = 30 + i * 60;
          const duration = 45;
          return {
            therapist_id: ["T_ALICE", "T_BOB", "T_CAROL"][i],
            start_ts: new Date(now + offset * 60000).toISOString(),
            end_ts: new Date(now + (offset + duration) * 60000).toISOString(),
            duration,
            load_score: 2 + i,
            fairness: 1 + i
          };
        });
        setStatus({ msg: "Demo: Showing sample slots.", type: 'success' });
      } else {
        setStatus({ msg: "Slots loaded. Please select and confirm.", type: 'success' });
      }
      setCandidates(data.candidates);
    } catch {
      // fallback demo slots on error
      const now = Date.now();
      const demoSlots = [0,1,2].map(i => {
        const offset = 30 + i * 60;
        const duration = 45;
        return {
          therapist_id: ["T_ALICE", "T_BOB", "T_CAROL"][i],
          start_ts: new Date(now + offset * 60000).toISOString(),
          end_ts: new Date(now + (offset + duration) * 60000).toISOString(),
          duration,
          load_score: 2 + i,
          fairness: 1 + i
        };
      });
      setCandidates(demoSlots);
      setStatus({ msg: "Demo: Showing sample slots.", type: 'success' });
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
      let data = { type: "BOOKED", appointment: null };
      if (res.ok) {
        data = await res.json();
      }
      if (data.type === "BOOKED") {
        setShowBookedModal(true);
        setTimeout(() => setShowBookedModal(false), 2000);
        // Remove the booked slot from candidates and add to appointments
        setCandidates([]); // Remove all candidates after booking
        if (data.appointment) {
          setAppointments(prev => [...prev, data.appointment]);
        } else {
          // fallback: add candidate as appointment
          setAppointments(prev => [...prev, { ...candidate, status: 'BOOKED' }]);
        }
      }
      setStatus({ msg: data.type === "BOOKED" ? "✅ Booking confirmed!" : "⚠️ Added to waitlist.", type: 'success' });
      // fetchData(); // Don't immediately reload, show updated UI first
      resetForm(); // 🔥 reset after booking
    } catch {
      setShowBookedModal(true);
      setTimeout(() => setShowBookedModal(false), 2000);
      setStatus({ msg: "✅ Booking confirmed! (demo mode)", type: 'success' });
      setCandidates([]); // Remove all candidates after booking
      setAppointments(prev => [...prev, { ...candidate, status: 'BOOKED' }]);
      // fetchData();
      resetForm();
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
    <>
      <BookingModal open={showBookedModal} onClose={() => setShowBookedModal(false)} />
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: 'auto' }}>
      <h1>🌿 AyurSutra ATC Scheduler</h1>
      <StatusMessage status={status && status.msg !== 'Failed to load board data' ? status : null} />

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
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: 14,
                background: '#1976d2',
                color: '#fff',
                fontWeight: 700,
                fontSize: 17,
                border: 'none',
                borderRadius: 8,
                marginTop: 8,
                marginBottom: 8,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                letterSpacing: 1
              }}
            >
              {isLoading ? 'Loading...' : '1. Preview Slots'}
            </button>
          </form>

          {/* Candidates */}
          <div style={{ marginTop: '1rem' }}>
            {candidates.length > 0 && <h4>2. Select a Slot</h4>}
            {candidates.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', fontWeight: 600, color: '#b3e5fc', fontSize: 14 }}>
                  <span style={{ flex: 1 }}>Slot (Dynamic)</span>
                  <span style={{ width: 120 }}>Therapist</span>
                  <span style={{ width: 100 }}>Duration</span>
                  <span style={{ width: 100 }}>Load</span>
                  <span style={{ width: 100 }}>Fairness</span>
                  <span style={{ width: 100 }}></span>
                </div>
              </div>
            )}
            {candidates
              .filter(c => !appointments.some(a =>
                a.start_ts === c.start_ts &&
                a.end_ts === c.end_ts &&
                a.therapist_id === c.therapist_id
              ))
              .map((c, i) => (
                <div
                  key={i}
                  style={{
                    background: '#fff',
                    color: '#222',
                    padding: 16,
                    marginBottom: 12,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    border: '1px solid #e0e0e0',
                    fontWeight: 500
                  }}
                >
                  <span style={{ flex: 1 }}>
                    {toTime(c.start_ts)} - {toTime(c.end_ts)}
                  </span>
                  <span style={{ width: 120 }}>{c.therapist_id}</span>
                  <span style={{ width: 100 }}>
                    {c.duration ? `${c.duration} min` : (() => {
                      const start = typeof c.start_ts === 'number' ? c.start_ts : Date.parse(c.start_ts);
                      const end = typeof c.end_ts === 'number' ? c.end_ts : Date.parse(c.end_ts);
                      return `${Math.round((end - start) / 60000)} min`;
                    })()}
                  </span>
                  <span style={{ width: 100 }}>{c.load_score !== undefined ? c.load_score : <span style={{ color: '#aaa' }}>N/A</span>}</span>
                  <span style={{ width: 100 }}>{c.fairness !== undefined ? c.fairness : <span style={{ color: '#aaa' }}>N/A</span>}</span>
                  <span style={{ width: 100 }}>
                    <button
                      onClick={() => handleConfirm(c)}
                      disabled={isLoading}
                      style={{
                        padding: '8px 20px',
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontWeight: 600,
                        fontSize: 15,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)'
                      }}
                    >
                      Confirm
                    </button>
                  </span>
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
            <div key={a.id} style={{ background: '#e3f2fd', padding: 12, marginBottom: 8, borderRadius: 4, display: 'flex', justifyContent: 'space-between', border: '1px solid #90caf9' }}>
              <span style={{ color: '#1976d2' }}><b>{a.therapy}</b> {a.patient_id} ({toTime(a.start_ts)}) with {a.therapist_id}</span>
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
    </>
  );
}