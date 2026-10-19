-- ==============================================================================
-- VYUGAM AI HACKATHON 2026: COMPLETE POSTGRESQL SUPABASE SCHEMA & SEED DATA
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/juxfdgsyhpmyujxghqgb/sql/new)
-- ==============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('student', 'evaluator', 'admin')),
  college TEXT DEFAULT 'Sri Eshwar College of Engineering',
  department TEXT DEFAULT 'Computer Science & Engineering',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROBLEM STATEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.problem_statements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  domain_bucket TEXT NOT NULL,
  organization TEXT NOT NULL,
  description TEXT NOT NULL,
  desired_outcome TEXT NOT NULL,
  complexity TEXT NOT NULL,
  dataset_url TEXT,
  submissions_count INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ps_cat ON public.problem_statements(category);
CREATE INDEX IF NOT EXISTS idx_ps_dom ON public.problem_statements(domain_bucket);

-- 3. TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  leader_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  college TEXT NOT NULL,
  track TEXT NOT NULL,
  problem_statement_id TEXT REFERENCES public.problem_statements(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'forming' CHECK(status IN ('forming', 'submitted', 'shortlisted', 'finalist', 'winner')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_ps ON public.teams(problem_statement_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader ON public.teams(leader_id);

-- 4. TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.team_members (
  id TEXT PRIMARY KEY,
  team_id TEXT REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role_in_team TEXT NOT NULL,
  gender TEXT NOT NULL,
  college_id_no TEXT,
  year_of_study TEXT
);

CREATE INDEX IF NOT EXISTS idx_members_team ON public.team_members(team_id);

-- 5. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  team_id TEXT UNIQUE REFERENCES public.teams(id) ON DELETE CASCADE,
  problem_statement_id TEXT REFERENCES public.problem_statements(id) ON DELETE CASCADE,
  idea_title TEXT NOT NULL,
  executive_summary TEXT NOT NULL,
  proposed_solution TEXT NOT NULL,
  tech_stack TEXT NOT NULL,
  ppt_url TEXT,
  github_url TEXT,
  demo_video_url TEXT,
  status TEXT DEFAULT 'submitted' CHECK(status IN ('submitted', 'under_review', 'shortlisted', 'rejected', 'winner')),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_ps ON public.submissions(problem_statement_id);
CREATE INDEX IF NOT EXISTS idx_sub_team ON public.submissions(team_id);

-- 6. EVALUATIONS TABLE
CREATE TABLE IF NOT EXISTS public.evaluations (
  id TEXT PRIMARY KEY,
  submission_id TEXT REFERENCES public.submissions(id) ON DELETE CASCADE,
  evaluator_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  innovation_score INTEGER NOT NULL CHECK(innovation_score >= 0 AND innovation_score <= 20),
  technical_score INTEGER NOT NULL CHECK(technical_score >= 0 AND technical_score <= 20),
  feasibility_score INTEGER NOT NULL CHECK(feasibility_score >= 0 AND feasibility_score <= 20),
  ui_ux_score INTEGER NOT NULL CHECK(ui_ux_score >= 0 AND ui_ux_score <= 20),
  presentation_score INTEGER NOT NULL CHECK(presentation_score >= 0 AND presentation_score <= 20),
  total_score INTEGER NOT NULL CHECK(total_score >= 0 AND total_score <= 100),
  comments TEXT,
  decision TEXT NOT NULL CHECK(decision IN ('Shortlist', 'Reject', 'Under Review')),
  evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eval_sub ON public.evaluations(submission_id);
CREATE INDEX IF NOT EXISTS idx_eval_evaluator ON public.evaluations(evaluator_id);

-- 7. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  is_banner INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PASSWORD RESETS TABLE
CREATE TABLE IF NOT EXISTS public.password_resets (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pw_reset_email ON public.password_resets(email);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enabling RLS with permissive policies ensures both Express Backend & Web client work seamlessly
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid collision
DROP POLICY IF EXISTS "Allow all users" ON public.users;
DROP POLICY IF EXISTS "Allow all problem_statements" ON public.problem_statements;
DROP POLICY IF EXISTS "Allow all teams" ON public.teams;
DROP POLICY IF EXISTS "Allow all team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow all submissions" ON public.submissions;
DROP POLICY IF EXISTS "Allow all evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Allow all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow all contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow all password_resets" ON public.password_resets;

CREATE POLICY "Allow all users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all problem_statements" ON public.problem_statements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all team_members" ON public.team_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all submissions" ON public.submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all evaluations" ON public.evaluations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all contact_messages" ON public.contact_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all password_resets" ON public.password_resets FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- 1. SEED USERS
INSERT INTO public.users (id, name, email, password, role, college, department, phone) VALUES
('user-admin-01', 'Dr. A. R. Sharma (Hackathon Chair)', 'admin@sece.ac.in', '$2b$10$mRa4eiza0MS9S3Yv96WxY.eLjsSLr2h6FR3yxRnmi6OZDfT0JQBBy', 'admin', 'Sri Eshwar College of Engineering', 'AI & Data Science Department', '+91 98765 43210'),
('user-eval-01', 'Prof. Meera Nair (AI Expert)', 'meera.evaluator@sece.ac.in', '$2b$10$YcrnySQPvvkk.DT92wpAa.gXt4OAl2vPC2ocpJAdI2LbNd.AqPX.y', 'evaluator', 'Sri Eshwar College of Engineering', 'Department of Computer Science', '+91 98765 11223'),
('user-eval-02', 'Dr. Rajesh Kumar (Cybersecurity Lead)', 'rajesh.evaluator@sece.ac.in', '$2b$10$kl8eGd7iIoLrUz0otc/eJ.duy5DJSpmMt76NTIX1ROguZnw29i/jC', 'evaluator', 'Sri Eshwar College of Engineering', 'Cybersecurity Wing', '+91 98765 44332'),
('user-student-01', 'Arjun Vikram (Team Lead)', 'arjun@sece.ac.in', '$2b$10$5GwEuIlF.WVwBGppu20FAeVW44XjpgbjE37/3xeleDkS/XFRaFDJ6', 'student', 'Sri Eshwar College of Engineering', 'Computer Science', '+91 91234 56789'),
('user-c871dc97', 'Priya Dharshini', 'priya@sece.ac.in', '$2b$10$bLpjICij/s5.xtAz8.7qt.pn52kzBvinTK5L66FffajVfXSHA/Qla', 'student', 'Sri Eshwar College of Engineering', 'AI & Data Science', '+91 98765 00112')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  college = EXCLUDED.college,
  department = EXCLUDED.department,
  phone = EXCLUDED.phone;

-- 2. SEED PROBLEM STATEMENTS (8 Official Vyugam Tracks)
INSERT INTO public.problem_statements (id, title, category, domain_bucket, organization, description, desired_outcome, complexity, dataset_url, submissions_count, is_active) VALUES
('VYUGAM-001', 'AI Driven Autonomous Campus Energy Optimization System', 'AI & Machine Learning', 'Software', 'Ministry of Education: Renewable Energy Wing', 'Develop an intelligent machine learning algorithm to predict campus electricity load based on timetable, weather, and occupancy sensors, optimizing solar inverter switching and reducing HVAC power consumption by up to 30%.', 'Interactive dashboard with real time sensor telemetry ingestion, predictive load graph, automated relay switching commands, and dynamic cost analytics.', 'Hard', 'https://github.com/vyugam-ai/campus-energy-dataset', 1, 1),
('VYUGAM-002', 'Deepfake Video Detection and Forensics for Academic Verification', 'Cybersecurity', 'Software', 'Department of Computer Science and Security', 'Build a multi modal deep neural network to detect generative deepfake media in student identity submissions, remote exams, and official certificates using spatial temporal facial inconsistency analysis.', 'RESTful API and web app that outputs confidence score, heatmap of tampered frames, and downloadable PDF forensic report.', 'Hard', 'https://github.com/vyugam-ai/deepfake-forensics-data', 0, 1),
('VYUGAM-003', 'Smart Health Monitoring Wearable with On Device Edge ML', 'IoT & Robotics', 'Both', 'Vyugam Healthcare & Bio-Engineering Cell', 'Design a low cost wearable patch with microcontrollers running tinyML models to detect early cardiac arrhythmia and hypoxia in real time without continuous internet connection.', 'Hardware schematic, embedded C firmware, Bluetooth low energy mobile app, and cloud sync protocol.', 'Medium', 'https://github.com/vyugam-ai/ecg-arrhythmia-signals', 0, 1),
('VYUGAM-004', 'Blockchain Based Decentralized Academic Credentials & Verification', 'Blockchain & FinTech', 'Software', 'Vyugam Registrar & Academic Council', 'Implement a zero knowledge proof enabled Ethereum smart contract framework to issue tamper proof digital degrees and mark sheets, allowing instant verification by employers worldwide.', 'Deployed smart contracts, issuer portal, student wallet interface, and one click employer verification QR system.', 'Medium', 'https://github.com/vyugam-ai/zk-credentials-contracts', 0, 1),
('VYUGAM-005', 'Adaptive AI Tutor for Multilingual Regional Language Education', 'EdTech & Social Innovation', 'Software', 'National Language Mission & Vyugam AI Lab', 'Construct a voice enabled adaptive tutoring assistant in Tamil, Hindi, Telugu, and English that converts STEM curriculum into interactive conversational modules for rural students.', 'Web and mobile app with voice input, real time audio synthesis, gamified quiz generation, and offline caching support.', 'Easy', 'https://github.com/vyugam-ai/indic-stem-corpus', 0, 1),
('VYUGAM-006', 'Real Time Traffic Flow Management and Emergency Vehicle Prioritization', 'Smart Healthcare', 'Both', 'Smart City Cell & Municipal Transport', 'Create an intelligent computer vision pipeline utilizing existing CCTV camera feeds to dynamically control green signal durations and carve out emergency corridors for ambulances.', 'YOLOv8 vehicle tracking pipeline, dynamic signal controller simulator, and ambulance routing mobile app.', 'Hard', 'https://github.com/vyugam-ai/traffic-cctv-dataset', 0, 1),
('VYUGAM-007', 'Automated Code Vulnerability Repair with Large Language Models', 'AI & Machine Learning', 'Software', 'Vyugam Cyber Defense Lab', 'Develop a specialized coding assistant LLM agent that scans source repositories for OWASP Top 10 security bugs, generates patch diffs, and writes automated regression unit tests.', 'VS Code plugin and CLI tool with automated pull request creation and patch verification engine.', 'Hard', 'https://github.com/vyugam-ai/security-patches-benchmark', 0, 1),
('VYUGAM-008', 'Precision Agriculture Soil Moisture & Crop Disease Detection Drone System', 'Clean Energy & Sustainability', 'Both', 'AgriTech Innovation Center', 'Combine multispectral aerial camera imagery with IoT soil sensors to deliver micro level irrigation maps and early fungal infection alerts to local farmers via SMS.', 'Drone ground control software, plant disease computer vision classifier, and low bandwidth SMS alert server.', 'Medium', 'https://github.com/vyugam-ai/crop-multispectral-data', 0, 1)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  domain_bucket = EXCLUDED.domain_bucket,
  organization = EXCLUDED.organization,
  description = EXCLUDED.description,
  desired_outcome = EXCLUDED.desired_outcome,
  complexity = EXCLUDED.complexity,
  dataset_url = EXCLUDED.dataset_url;

-- 3. SEED SAMPLE TEAMS
INSERT INTO public.teams (id, name, leader_id, college, track, problem_statement_id, status) VALUES
('team-neural-knights-01', 'Neural Knights', 'user-student-01', 'Sri Eshwar College of Engineering', 'Software', 'VYUGAM-001', 'submitted')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  leader_id = EXCLUDED.leader_id,
  college = EXCLUDED.college,
  track = EXCLUDED.track,
  problem_statement_id = EXCLUDED.problem_statement_id,
  status = EXCLUDED.status;

-- 4. SEED SAMPLE TEAM MEMBERS
INSERT INTO public.team_members (id, team_id, name, email, role_in_team, gender, college_id_no, year_of_study) VALUES
('6fef406d-cb83-4469-924f-769414886676', 'team-neural-knights-01', 'Arjun Vikram', 'arjun@sece.ac.in', 'Leader & AI Dev', 'Male', 'SECE2023CS001', '3rd Year'),
('032d4b39-aef0-47ca-9ca9-0fd141f13afa', 'team-neural-knights-01', 'Samyuktha R', 'samyuktha@sece.ac.in', 'Full Stack Engineer', 'Female', 'SECE2023CS042', '3rd Year'),
('fffa472c-0288-4373-8b24-e6cdb3131460', 'team-neural-knights-01', 'Kavya S', 'kavya@sece.ac.in', 'Data Scientist', 'Female', 'SECE2023DS012', '2nd Year')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED SAMPLE SUBMISSIONS
INSERT INTO public.submissions (id, team_id, problem_statement_id, idea_title, executive_summary, proposed_solution, tech_stack, ppt_url, github_url, demo_video_url, status) VALUES
('sub-neural-01', 'team-neural-knights-01', 'VYUGAM-001', 'CampusGrid AI: Smart Microgrid Optimization Protocol', 'An end to end IoT telemetry pipeline powered by LSTM neural networks to dynamically predict classroom occupancy and balance solar inverter output.', 'Our solution features edge sensors connected via MQTT, real time stream processing with Apache Kafka, and a Next.js live telemetry dashboard for campus facilities management.', 'Python, PyTorch, React, Node.js, MQTT, Docker, PostgreSQL', 'https://sece.ac.in/docs/neural_knights_ppt.pdf', 'https://github.com/vyugam-ai/neural-knights-energy-ai', 'https://youtube.com/watch?v=demo_vyugam_001', 'under_review')
ON CONFLICT (id) DO UPDATE SET
  idea_title = EXCLUDED.idea_title,
  executive_summary = EXCLUDED.executive_summary,
  proposed_solution = EXCLUDED.proposed_solution,
  tech_stack = EXCLUDED.tech_stack,
  ppt_url = EXCLUDED.ppt_url,
  github_url = EXCLUDED.github_url,
  demo_video_url = EXCLUDED.demo_video_url,
  status = EXCLUDED.status;

-- 6. SEED SAMPLE EVALUATIONS
INSERT INTO public.evaluations (id, submission_id, evaluator_id, innovation_score, technical_score, feasibility_score, ui_ux_score, presentation_score, total_score, comments, decision) VALUES
('c1fe20a2-3990-448f-9bcc-1be0ec41cfca', 'sub-neural-01', 'user-eval-01', 18, 19, 17, 18, 19, 91, 'Exceptional architectural design and clear IoT integration strategy. Highly viable for immediate college campus implementation.', 'Shortlist')
ON CONFLICT (id) DO UPDATE SET
  total_score = EXCLUDED.total_score,
  comments = EXCLUDED.comments,
  decision = EXCLUDED.decision;

-- 7. SEED ANNOUNCEMENTS
INSERT INTO public.announcements (id, title, message, category, is_banner) VALUES
('ann-1', 'Vyugam AI Hackathon 2026 Registration Now Live', 'Register your teams of 3 to 6 members by October 25, 2026. Female participation is strongly encouraged!', 'Urgent', 1),
('ann-2', 'Problem Statement Selection Open for All Verified Teams', 'Explore the 8 multidisciplinary problem statements and lock your choices before the initial draft submission deadline.', 'General', 0),
('ann-3', 'Grand Finale Prize Pool Announced: INR 5,00,000 + Incubation Support', 'Top 3 winners across hardware and software tracks will receive direct entry into Vyugam Incubation Hub and mentorship from industry leaders.', 'General', 0)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  message = EXCLUDED.message,
  category = EXCLUDED.category,
  is_banner = EXCLUDED.is_banner;

-- 8. SEED CONTACT MESSAGES
INSERT INTO public.contact_messages (id, name, email, subject, message) VALUES
('msg-001', 'Kungumapriyaa M', 'kungumapriyaa.m2024aids@sece.ac.in', 'Hackathon Team Inquiry', 'Looking forward to participating in Vyugam AI Hackathon 2026!')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- REFRESH POSTGRESQL ROW ESTIMATES (Updates "ROWS (ESTIMATED)" in Supabase UI)
-- ==============================================================================
ANALYZE public.users;
ANALYZE public.problem_statements;
ANALYZE public.teams;
ANALYZE public.team_members;
ANALYZE public.submissions;
ANALYZE public.evaluations;
ANALYZE public.announcements;
ANALYZE public.contact_messages;
ANALYZE public.password_resets;

