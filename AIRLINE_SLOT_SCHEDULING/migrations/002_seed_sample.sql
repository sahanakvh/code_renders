INSERT INTO therapists (id, name, skills, rr_index, minutes_worked_today) VALUES
('T1','Therapist A', ARRAY['Abhyanga','Basti'], 0, 120)
ON CONFLICT (id) DO NOTHING;

INSERT INTO therapists (id, name, skills, rr_index, minutes_worked_today) VALUES
('T2','Therapist B', ARRAY['Swedana','Abhyanga'], 1, 60)
ON CONFLICT (id) DO NOTHING;

INSERT INTO therapists (id, name, skills, rr_index, minutes_worked_today) VALUES
('T3','Therapist C', ARRAY['Abhyanga','Virechana'], 2, 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rooms (id, name, tags) VALUES
('R1','Room 1', '{}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rooms (id, name, tags) VALUES
('R2','Room 2', '{}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO appointments (id, patient_id, therapy, therapist_id, room_id, start_ts, end_ts, status)
VALUES ('EX1','P_EXIST','Abhyanga','T1','R1','2025-09-15 09:00','2025-09-15 10:00','SCHEDULED')
ON CONFLICT (id) DO NOTHING;
