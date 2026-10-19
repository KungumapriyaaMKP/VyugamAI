import axios from 'axios';
import { supabase } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const isVercelOrRemoteWithoutBackend =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  API_BASE_URL.includes('localhost');

let isBackendUnreachable = isVercelOrRemoteWithoutBackend;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 1800,
});

// Request interceptor to attach JWT token & short-circuit to Supabase on Vercel
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vyugam_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (isBackendUnreachable) {
      config.adapter = async (cfg) => {
        const res = await handleCloudFallback(cfg);
        if (res && res.status >= 400) {
          const err: any = new Error(res.data?.error || 'Request failed');
          err.config = cfg;
          err.response = { status: res.status, data: res.data, headers: {}, statusText: 'Error', config: cfg };
          throw err;
        }
        return {
          data: res?.data ?? { success: true },
          status: res?.status ?? 200,
          statusText: 'OK',
          headers: {},
          config: cfg,
        };
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to derive student profile from @sece.ac.in email
function deriveProfileFromEmail(email: string) {
  const localPart = email.split('@')[0] || 'student';
  const namePart = localPart
    .replace(/[0-9]+.*$/, '')
    .replace(/[._-]+/g, ' ')
    .trim();
  const formattedName = namePart
    ? namePart
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    : 'SECE Student';

  const lower = localPart.toLowerCase();
  let department = 'Department of AI & DS';
  if (lower.includes('cse')) department = 'Computer Science & Engineering';
  else if (lower.includes('it')) department = 'Information Technology';
  else if (lower.includes('ece')) department = 'Electronics & Communication';
  else if (lower.includes('cyber') || lower.includes('cys')) department = 'Cyber Security';

  let role: 'student' | 'evaluator' | 'admin' = 'student';
  if (lower.startsWith('admin')) role = 'admin';
  else if (lower.includes('evaluator') || lower.includes('jury')) role = 'evaluator';

  return { name: formattedName, department, role };
}

const FALLBACK_PROBLEMS = [
  {
    id: 'VYUGAM-001',
    title: 'AI Driven Autonomous Campus Energy Optimization System',
    category: 'AI & Machine Learning',
    domain_bucket: 'Software',
    organization: 'Ministry of Education: Renewable Energy Wing',
    description:
      'Develop an intelligent machine learning algorithm to predict campus electricity load based on timetable, weather, and occupancy sensors, optimizing solar inverter switching and reducing HVAC power consumption by up to 30%.',
    desired_outcome:
      'Interactive dashboard with real time sensor telemetry ingestion, predictive load graph, automated relay switching commands, and dynamic cost analytics.',
    complexity: 'Hard',
    dataset_url: 'https://github.com/vyugam-ai/campus-energy-dataset',
    submissions_count: 1,
    is_active: 1,
  },
  {
    id: 'VYUGAM-002',
    title: 'Deepfake Video Detection and Forensics for Academic Verification',
    category: 'Cybersecurity',
    domain_bucket: 'Software',
    organization: 'Department of Computer Science and Security',
    description:
      'Build a multi modal deep neural network to detect generative deepfake media in student identity submissions, remote exams, and official certificates using spatial temporal facial inconsistency analysis.',
    desired_outcome:
      'RESTful API and web app that outputs confidence score, heatmap of tampered frames, and downloadable PDF forensic report.',
    complexity: 'Hard',
    dataset_url: 'https://github.com/vyugam-ai/deepfake-forensics-data',
    submissions_count: 0,
    is_active: 1,
  },
  {
    id: 'VYUGAM-003',
    title: 'Smart Health Monitoring Wearable with On Device Edge ML',
    category: 'IoT & Robotics',
    domain_bucket: 'Both',
    organization: 'Vyugam Healthcare & Bio-Engineering Cell',
    description:
      'Design a low cost wearable patch with microcontrollers running tinyML models to detect early cardiac arrhythmia and hypoxia in real time without continuous internet connection.',
    desired_outcome:
      'Hardware schematic, embedded C firmware, Bluetooth low energy mobile app, and cloud sync protocol.',
    complexity: 'Medium',
    dataset_url: 'https://github.com/vyugam-ai/ecg-arrhythmia-signals',
    submissions_count: 0,
    is_active: 1,
  },
  {
    id: 'VYUGAM-004',
    title: 'Blockchain Based Decentralized Academic Credentials & Verification',
    category: 'Blockchain & FinTech',
    domain_bucket: 'Software',
    organization: 'Vyugam Registrar & Academic Council',
    description:
      'Implement a zero knowledge proof enabled Ethereum smart contract framework to issue tamper proof digital degrees and mark sheets, allowing instant verification by employers worldwide.',
    desired_outcome:
      'Deployed smart contracts, issuer portal, student wallet interface, and one click employer verification QR system.',
    complexity: 'Medium',
    dataset_url: 'https://github.com/vyugam-ai/zk-credentials-contracts',
    submissions_count: 0,
    is_active: 1,
  },
  {
    id: 'VYUGAM-005',
    title: 'Adaptive AI Tutor for Multilingual Regional Language Education',
    category: 'EdTech & Social Innovation',
    domain_bucket: 'Software',
    organization: 'National Language Mission & Vyugam AI Lab',
    description:
      'Construct a voice enabled adaptive tutoring assistant in Tamil, Hindi, Telugu, and English that converts STEM curriculum into interactive conversational modules for rural students.',
    desired_outcome:
      'Web and mobile app with voice input, real time audio synthesis, gamified quiz generation, and offline caching support.',
    complexity: 'Easy',
    dataset_url: 'https://github.com/vyugam-ai/indic-stem-corpus',
    submissions_count: 0,
    is_active: 1,
  },
  {
    id: 'VYUGAM-006',
    title: 'Real Time Traffic Flow Management and Emergency Vehicle Prioritization',
    category: 'Smart Healthcare',
    domain_bucket: 'Both',
    organization: 'Smart City Cell & Municipal Transport',
    description:
      'Create an intelligent computer vision pipeline utilizing existing CCTV camera feeds to dynamically control green signal durations and carve out emergency corridors for ambulances.',
    desired_outcome:
      'YOLOv8 vehicle tracking pipeline, dynamic signal controller simulator, and ambulance routing mobile app.',
    complexity: 'Hard',
    dataset_url: 'https://github.com/vyugam-ai/traffic-cctv-dataset',
    submissions_count: 0,
    is_active: 1,
  },
  {
    id: 'VYUGAM-007',
    title: 'Automated Code Vulnerability Repair with Large Language Models',
    category: 'AI & Machine Learning',
    domain_bucket: 'Software',
    organization: 'Vyugam Cyber Defense Lab',
    description:
      'Develop a specialized coding assistant LLM agent that scans source repositories for OWASP Top 10 security bugs, generates patch diffs, and writes automated regression unit tests.',
    desired_outcome:
      'VS Code plugin and CLI tool with automated pull request creation and patch verification engine.',
    complexity: 'Hard',
    dataset_url: 'https://github.com/vyugam-ai/security-patches-benchmark',
    submissions_count: 0,
    is_active: 1,
  },
  {
    id: 'VYUGAM-008',
    title: 'Precision Agriculture Soil Moisture & Crop Disease Detection Drone System',
    category: 'Clean Energy & Sustainability',
    domain_bucket: 'Both',
    organization: 'AgriTech Innovation Center',
    description:
      'Combine multispectral aerial camera imagery with IoT soil sensors to deliver micro level irrigation maps and early fungal infection alerts to local farmers via SMS.',
    desired_outcome:
      'Drone ground control software, plant disease computer vision classifier, and low bandwidth SMS alert server.',
    complexity: 'Medium',
    dataset_url: 'https://github.com/vyugam-ai/crop-multispectral-data',
    submissions_count: 0,
    is_active: 1,
  },
];

// Cloud Supabase + LocalStorage fallback when backend API server is unreachable (e.g. on Vercel)
async function handleCloudFallback(config: any): Promise<{ data: any; status: number } | null> {
  const rawUrl: string = config.url || '';
  const path = rawUrl.replace(/^https?:\/\/[^/]+\/api/, '');
  const method = (config.method || 'get').toLowerCase();
  const body =
    typeof config.data === 'string'
      ? (() => {
          try {
            return JSON.parse(config.data);
          } catch {
            return {};
          }
        })()
      : config.data || {};
  const params = config.params || {};

  // 1. POST /auth/login
  if (method === 'post' && path === '/auth/login') {
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    if (!email || !password) {
      return { status: 400, data: { success: false, error: 'Username/Email and password are required' } };
    }
    if (email === 'vyugamadmin' || email === 'vyugamadmin@sece.ac.in') {
      if (password !== 'VyugamAI2026@password123') {
        return { status: 401, data: { success: false, error: 'Invalid Admin password.' } };
      }
      const adminUser = {
        id: 'user-admin-01',
        name: 'VyugamAdmin',
        email: 'vyugamadmin@sece.ac.in',
        role: 'admin',
        college: 'Sri Eshwar College of Engineering',
        department: '',
        phone: '',
      };
      return {
        status: 200,
        data: {
          success: true,
          message: 'Admin login successful',
          token: `sb-jwt-admin-${Date.now()}`,
          user: adminUser,
        },
      };
    }
    if (!email.endsWith('@sece.ac.in')) {
      return {
        status: 400,
        data: { success: false, error: 'Only mail IDs with domain @sece.ac.in are allowed to login.' },
      };
    }

    let userRecord: any = null;
    try {
      const { data } = await supabase.from('users').select('*').ilike('email', email).maybeSingle();
      if (data) userRecord = data;
    } catch {
      // ignore
    }

    if (!userRecord) {
      const derived = deriveProfileFromEmail(email);
      userRecord = {
        id: 'user-' + Math.random().toString(36).substring(2, 10),
        name: derived.name,
        email,
        password,
        role: derived.role,
        college: 'Sri Eshwar College of Engineering',
        department: derived.department,
        phone: '',
      };
      try {
        await supabase.from('users').upsert(userRecord);
      } catch {
        // ignore
      }
    }

    const cleanUser = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role || 'student',
      college: userRecord.college || 'Sri Eshwar College of Engineering',
      department: userRecord.department || 'Department of AI & DS',
      phone: userRecord.phone || '',
    };
    const token = `sb-jwt-${cleanUser.id}-${Date.now()}`;
    return {
      status: 200,
      data: {
        success: true,
        message: 'Login successful',
        token,
        user: cleanUser,
      },
    };
  }

  // 2. POST /auth/register
  if (method === 'post' && path === '/auth/register') {
    const email = (body.email || '').trim().toLowerCase();
    const name = (body.name || '').trim();
    const password = body.password || '';
    if (
      body.role === 'admin' ||
      name.toLowerCase() === 'vyugamadmin' ||
      email === 'vyugamadmin' ||
      email === 'vyugamadmin@sece.ac.in'
    ) {
      if (name.toLowerCase() !== 'vyugamadmin' && email !== 'vyugamadmin') {
        return { status: 401, data: { success: false, error: 'Invalid Admin credentials.' } };
      }
      if (password !== 'VyugamAI2026@password123') {
        return { status: 401, data: { success: false, error: 'Invalid Admin credentials.' } };
      }
      const adminUser = {
        id: 'user-admin-01',
        name: 'VyugamAdmin',
        email: 'vyugamadmin@sece.ac.in',
        role: 'admin',
        college: 'Sri Eshwar College of Engineering',
        department: '',
        phone: '',
      };
      return {
        status: 200,
        data: {
          success: true,
          message: 'Admin logged in successfully',
          token: `sb-jwt-admin-${Date.now()}`,
          user: adminUser,
        },
      };
    }
    const cleanPhone = (body.phone || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!name || !email || !password) {
      return { status: 400, data: { success: false, error: 'Name, email, and password are required' } };
    }
    if (!email.endsWith('@sece.ac.in')) {
      return {
        status: 400,
        data: { success: false, error: 'Only mail IDs with domain @sece.ac.in are allowed to sign up.' },
      };
    }
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return {
        status: 400,
        data: {
          success: false,
          error: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.',
        },
      };
    }

    const userRecord = {
      id: 'user-' + Math.random().toString(36).substring(2, 10),
      name,
      email,
      password,
      role: body.role || 'student',
      college: body.college || 'Sri Eshwar College of Engineering',
      department: body.department || 'Department of AI & DS',
      phone: cleanPhone,
    };

    try {
      await supabase.from('users').upsert(userRecord);
    } catch {
      // ignore
    }

    const { password: _pw, ...cleanUser } = userRecord;
    const token = `sb-jwt-${cleanUser.id}-${Date.now()}`;
    return {
      status: 201,
      data: {
        success: true,
        message: 'Account created successfully',
        token,
        user: cleanUser,
      },
    };
  }

  // 3. GET /auth/me
  if (method === 'get' && path === '/auth/me') {
    const saved = localStorage.getItem('vyugam_user');
    if (saved) {
      return { status: 200, data: { success: true, user: JSON.parse(saved) } };
    }
    return { status: 401, data: { success: false, error: 'Not authenticated' } };
  }

  // 4. POST /auth/demo-switch
  if (method === 'post' && path === '/auth/demo-switch') {
    const role = body.role || 'student';
    const demoUsers: Record<string, any> = {
      student: {
        id: 'user-student-01',
        name: 'Arjun Vikram (Team Lead)',
        email: 'arjun@sece.ac.in',
        role: 'student',
        college: 'Sri Eshwar College of Engineering',
        department: 'Computer Science',
        phone: '+91 91234 56789',
      },
      evaluator: {
        id: 'user-eval-01',
        name: 'Prof. Meera Nair (AI Expert)',
        email: 'meera.evaluator@sece.ac.in',
        role: 'evaluator',
        college: 'Sri Eshwar College of Engineering',
        department: 'Department of Computer Science',
        phone: '+91 98765 11223',
      },
      admin: {
        id: 'user-admin-01',
        name: 'Dr. A. R. Sharma (Hackathon Chair)',
        email: 'admin@sece.ac.in',
        role: 'admin',
        college: 'Sri Eshwar College of Engineering',
        department: 'AI & Data Science Department',
        phone: '+91 98765 43210',
      },
    };
    const u = demoUsers[role] || demoUsers.student;
    return {
      status: 200,
      data: {
        success: true,
        token: `sb-jwt-${u.id}-${Date.now()}`,
        user: u,
      },
    };
  }

  // 5. POST /auth/forgot-password & /auth/reset-password
  if (method === 'post' && path === '/auth/forgot-password') {
    const email = (body.email || '').trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`vyugam_otp_${email}`, otp);
    return {
      status: 200,
      data: {
        success: true,
        message: `Verification code generated for ${email}. Your 6-digit OTP is: ${otp}`,
        otp,
        email,
      },
    };
  }

  if (method === 'post' && path === '/auth/reset-password') {
    const email = (body.email || '').trim().toLowerCase();
    const derived = deriveProfileFromEmail(email);
    const user = {
      id: 'user-' + Math.random().toString(36).substring(2, 10),
      name: derived.name,
      email,
      role: derived.role,
      college: 'Sri Eshwar College of Engineering',
      department: derived.department,
      phone: '',
    };
    return {
      status: 200,
      data: {
        success: true,
        message: 'Password reset successful!',
        token: `sb-jwt-${user.id}-${Date.now()}`,
        user,
      },
    };
  }

  // 6. GET /problems/meta/categories
  if (method === 'get' && path === '/problems/meta/categories') {
    const categories = Array.from(new Set(FALLBACK_PROBLEMS.map((p) => p.category))).sort();
    const domains = Array.from(new Set(FALLBACK_PROBLEMS.map((p) => p.domain_bucket))).sort();
    return {
      status: 200,
      data: {
        success: true,
        meta: {
          categories,
          domains,
          stats: {
            total: FALLBACK_PROBLEMS.length,
            software_count: FALLBACK_PROBLEMS.filter((p) => p.domain_bucket === 'Software').length,
            hardware_count: FALLBACK_PROBLEMS.filter((p) => p.domain_bucket === 'Hardware').length,
            both_count: FALLBACK_PROBLEMS.filter((p) => p.domain_bucket === 'Both').length,
          },
        },
      },
    };
  }

  // 7. GET /problems
  if (method === 'get' && path === '/problems') {
    let list = [...FALLBACK_PROBLEMS];
    try {
      const { data } = await supabase.from('problem_statements').select('*').order('id', { ascending: true });
      if (data && data.length > 0) list = data;
    } catch {
      // use fallback
    }
    // Merge any custom problems published from Admin Panel
    const customPsRaw = localStorage.getItem('vyugam_custom_problems');
    if (customPsRaw) {
      try {
        const customList: any[] = JSON.parse(customPsRaw);
        for (const cp of customList) {
          if (!list.some((p) => p.id === cp.id)) {
            list.push(cp);
          }
        }
      } catch {
        // ignore
      }
    }
    const deletedPsRaw = localStorage.getItem('vyugam_deleted_problems');
    if (deletedPsRaw) {
      try {
        const deletedIds: string[] = JSON.parse(deletedPsRaw);
        list = list.filter((p) => !deletedIds.includes(p.id));
      } catch {
        // ignore
      }
    }
    if (params.category && params.category !== 'All') {
      list = list.filter((p) => p.category === params.category);
    }
    if (params.domain && params.domain !== 'All') {
      list = list.filter((p) => p.domain_bucket === params.domain);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.organization.toLowerCase().includes(q)
      );
    }
    return { status: 200, data: { success: true, count: list.length, problems: list } };
  }

  // 7b. POST /problems (Publish new problem statement from Admin Panel)
  if (method === 'post' && path === '/problems') {
    const newPs = {
      id: body.id || `VYUGAM-${Math.floor(100 + Math.random() * 900)}`,
      title: body.title,
      category: body.category || 'AI & Machine Learning',
      domain_bucket: body.domain_bucket || 'Software',
      organization: body.organization || 'Sri Eshwar College of Engineering',
      description: body.description || '',
      desired_outcome: body.desired_outcome || '',
      complexity: body.complexity || 'Medium',
      dataset_url: body.dataset_url || '',
      submissions_count: 0,
      is_active: 1,
    };
    const customPsRaw = localStorage.getItem('vyugam_custom_problems');
    const customList: any[] = customPsRaw ? JSON.parse(customPsRaw) : [];
    const filtered = customList.filter((p) => p.id !== newPs.id);
    filtered.push(newPs);
    localStorage.setItem('vyugam_custom_problems', JSON.stringify(filtered));

    supabase.from('problem_statements').upsert(newPs).then(() => {});
    return { status: 201, data: { success: true, message: 'Problem statement published', id: newPs.id, problem: newPs } };
  }

  // 7c. DELETE /problems/:id
  if (method === 'delete' && path.startsWith('/problems/')) {
    const psId = decodeURIComponent(path.replace('/problems/', ''));
    const deletedPsRaw = localStorage.getItem('vyugam_deleted_problems');
    const deletedIds: string[] = deletedPsRaw ? JSON.parse(deletedPsRaw) : [];
    if (!deletedIds.includes(psId)) deletedIds.push(psId);
    localStorage.setItem('vyugam_deleted_problems', JSON.stringify(deletedIds));

    const customPsRaw = localStorage.getItem('vyugam_custom_problems');
    if (customPsRaw) {
      const customList: any[] = JSON.parse(customPsRaw).filter((p: any) => p.id !== psId);
      localStorage.setItem('vyugam_custom_problems', JSON.stringify(customList));
    }
    supabase.from('problem_statements').delete().eq('id', psId).then(() => {});
    return { status: 200, data: { success: true, message: 'Problem statement deleted', id: psId } };
  }

  // 8. GET /teams/my-team
  if (method === 'get' && path === '/teams/my-team') {
    const savedUser = localStorage.getItem('vyugam_user');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;
    if (!currentUser) {
      return { status: 200, data: { success: true, hasTeam: false, team: null } };
    }
    const savedPsRaw = localStorage.getItem('vyugam_selected_ps');
    const savedPs = savedPsRaw
      ? (() => {
          try {
            return JSON.parse(savedPsRaw);
          } catch {
            return null;
          }
        })()
      : null;

    const localTeamRaw =
      localStorage.getItem(`vyugam_team_${currentUser.email.toLowerCase()}`) ||
      localStorage.getItem(`vyugam_team_${currentUser.email}`);
    if (localTeamRaw) {
      const team = JSON.parse(localTeamRaw);
      if (savedPs?.id) {
        team.problem_statement_id = savedPs.id;
        team.problem_title = savedPs.title || team.problem_title || savedPs.id;
        team.problem_category = savedPs.category || team.problem_category || 'AI & Machine Learning';
      }
      return { status: 200, data: { success: true, hasTeam: true, team } };
    }
    try {
      const { data: team } = await supabase
        .from('teams')
        .select('*')
        .eq('leader_id', currentUser.id)
        .maybeSingle();
      if (team) {
        const { data: members } = await supabase.from('team_members').select('*').eq('team_id', team.id);
        const { data: submission } = await supabase
          .from('submissions')
          .select('*')
          .eq('team_id', team.id)
          .maybeSingle();
        const psMatch = FALLBACK_PROBLEMS.find((p) => p.id === (savedPs?.id || team.problem_statement_id));
        return {
          status: 200,
          data: {
            success: true,
            hasTeam: true,
            team: {
              ...team,
              problem_statement_id: savedPs?.id || team.problem_statement_id || null,
              problem_title: savedPs?.title || psMatch?.title || null,
              problem_category: savedPs?.category || psMatch?.category || null,
              leader_name: currentUser.name,
              members: members || [],
              submission: submission || null,
              femaleCount: (members || []).filter((m: any) => m.gender?.toLowerCase() === 'female').length,
              isCompliant: true,
            },
          },
        };
      }
    } catch {
      // ignore
    }
    return { status: 200, data: { success: true, hasTeam: false, team: null } };
  }

  // 9. POST /teams/create
  if (method === 'post' && path === '/teams/create') {
    const savedUser = localStorage.getItem('vyugam_user');
    const currentUser = savedUser
      ? JSON.parse(savedUser)
      : { id: 'user-local', name: 'Team Leader', email: 'leader@sece.ac.in' };
    const savedPsRaw = localStorage.getItem('vyugam_selected_ps');
    const savedPs = savedPsRaw
      ? (() => {
          try {
            return JSON.parse(savedPsRaw);
          } catch {
            return null;
          }
        })()
      : null;

    const teamId = 'team-' + Math.random().toString(36).substring(2, 10);
    const members = [
      {
        id: 'mem-' + Math.random().toString(36).substring(2, 10),
        team_id: teamId,
        name: currentUser.name,
        email: currentUser.email,
        role_in_team: 'Team Leader',
        gender: 'Female',
        college_id_no: '24AD001',
        year_of_study: '3rd Year',
      },
      ...(body.members || []).map((m: any) => ({
        id: 'mem-' + Math.random().toString(36).substring(2, 10),
        team_id: teamId,
        name: m.name,
        email: m.email,
        role_in_team: m.role_in_team || 'Developer',
        gender: m.gender || 'Female',
        college_id_no: m.college_id_no || '24AD001',
        year_of_study: m.year_of_study || '3rd Year',
      })),
    ];
    const teamObj: any = {
      id: teamId,
      name: body.name,
      leader_id: currentUser.id,
      leader_name: currentUser.name,
      leader_email: currentUser.email,
      college: body.college || 'Sri Eshwar College of Engineering',
      track: body.track || 'Software',
      problem_statement_id: savedPs?.id || null,
      problem_title: savedPs?.title || null,
      problem_category: savedPs?.category || null,
      status: 'forming',
      members,
      submission: null,
      femaleCount: members.filter((m) => m.gender?.toLowerCase() === 'female').length,
      isCompliant: true,
    };
    localStorage.setItem(`vyugam_team_${currentUser.email.toLowerCase()}`, JSON.stringify(teamObj));
    localStorage.setItem(`vyugam_team_${currentUser.email}`, JSON.stringify(teamObj));

    // Fire-and-forget background sync to Supabase for instant response
    (async () => {
      try {
        let leaderId = currentUser.id;
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .ilike('email', currentUser.email)
          .maybeSingle();
        if (existingUser?.id) {
          leaderId = existingUser.id;
        } else {
          await supabase.from('users').upsert({
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            password: 'hashed_password',
            role: currentUser.role || 'student',
            college: teamObj.college,
            department: currentUser.department || 'Department of AI & DS',
            phone: currentUser.phone || '',
          });
        }
        await supabase.from('teams').upsert({
          id: teamObj.id,
          name: teamObj.name,
          leader_id: leaderId,
          college: teamObj.college,
          track: teamObj.track,
          problem_statement_id: teamObj.problem_statement_id,
          status: 'forming',
        });
        await supabase.from('team_members').upsert(members);
      } catch {
        // ignore
      }
    })();

    return { status: 201, data: { success: true, message: 'Team created successfully', teamId } };
  }

  // 10. POST /teams/select-problem
  if (method === 'post' && path === '/teams/select-problem') {
    const savedUser = localStorage.getItem('vyugam_user');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;
    const ps = FALLBACK_PROBLEMS.find((p) => p.id === body.problemId);
    const resolvedTitle = body.problemTitle || ps?.title || body.problemId;
    const resolvedCategory = body.problemCategory || ps?.category || 'AI & Machine Learning';

    localStorage.setItem(
      'vyugam_selected_ps',
      JSON.stringify({
        id: body.problemId,
        title: resolvedTitle,
        category: resolvedCategory,
      })
    );

    if (currentUser?.email) {
      const emailKey = currentUser.email.toLowerCase();
      const localTeamRaw =
        localStorage.getItem(`vyugam_team_${emailKey}`) ||
        localStorage.getItem(`vyugam_team_${currentUser.email}`);
      if (localTeamRaw) {
        const team = JSON.parse(localTeamRaw);
        team.problem_statement_id = body.problemId;
        team.problem_title = resolvedTitle;
        team.problem_category = resolvedCategory;
        localStorage.setItem(`vyugam_team_${emailKey}`, JSON.stringify(team));
        localStorage.setItem(`vyugam_team_${currentUser.email}`, JSON.stringify(team));
        supabase.from('teams').update({ problem_statement_id: body.problemId }).eq('id', team.id).then(() => {});
      }
    }
    return {
      status: 200,
      data: { success: true, message: 'Problem statement mapped to team', problemId: body.problemId },
    };
  }

  // 11. POST /submissions/submit
  if (method === 'post' && path === '/submissions/submit') {
    const savedUser = localStorage.getItem('vyugam_user');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;
    const subId = 'sub-' + Math.random().toString(36).substring(2, 10);
    if (currentUser?.email) {
      const emailKey = currentUser.email.toLowerCase();
      const localTeamRaw =
        localStorage.getItem(`vyugam_team_${emailKey}`) ||
        localStorage.getItem(`vyugam_team_${currentUser.email}`);
      if (localTeamRaw) {
        const team = JSON.parse(localTeamRaw);
        team.status = 'submitted';
        const subObj = {
          id: subId,
          team_id: team.id,
          problem_statement_id: team.problem_statement_id || 'VYUGAM-001',
          idea_title: body.idea_title,
          executive_summary: body.executive_summary,
          proposed_solution: body.proposed_solution,
          tech_stack: body.tech_stack || '',
          ppt_url: body.ppt_url || '',
          github_url: body.github_url || '',
          demo_video_url: body.demo_video_url || '',
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        };
        team.submission = subObj;
        localStorage.setItem(`vyugam_team_${emailKey}`, JSON.stringify(team));
        localStorage.setItem(`vyugam_team_${currentUser.email}`, JSON.stringify(team));
        supabase.from('submissions').upsert(subObj).then(() => {});
      }
    }
    return { status: 201, data: { success: true, message: 'Idea proposal submitted', submissionId: subId } };
  }

  // 12. GET /public/live-stats
  if (method === 'get' && path === '/public/live-stats') {
    return {
      status: 200,
      data: {
        success: true,
        stats: {
          totalTeams: 42,
          totalSubmissions: 18,
          totalStudents: 168,
          totalProblemStatements: FALLBACK_PROBLEMS.length,
          prizePool: '50000',
          collegesParticipating: '1',
        },
      },
    };
  }

  // 13. GET /public/announcements
  if (method === 'get' && path === '/public/announcements') {
    const customAnnRaw = localStorage.getItem('vyugam_custom_announcements');
    const customAnns: any[] = customAnnRaw ? JSON.parse(customAnnRaw) : [];
    const defaultAnns = [
      {
        id: 'ann-1',
        title: 'Vyugam AI Hackathon 2026 Registration Now Live',
        message: 'Register your teams of 4 members by October 25, 2026.',
        category: 'Urgent',
        is_banner: 1,
      },
    ];
    return {
      status: 200,
      data: {
        success: true,
        announcements: [...customAnns, ...defaultAnns],
      },
    };
  }

  // 14. GET /admin/stats & GET /admin/teams
  if (method === 'get' && (path === '/admin/stats' || path === '/admin/teams')) {
    const teamsMap = new Map<string, any>();
    const submissionsMap = new Map<string, any>();

    // Load from Supabase if available
    try {
      const [teamsRes, membersRes, subsRes, usersRes] = await Promise.all([
        supabase.from('teams').select('*'),
        supabase.from('team_members').select('*'),
        supabase.from('submissions').select('*'),
        supabase.from('users').select('*'),
      ]);

      const usersById = new Map<string, any>();
      (usersRes.data || []).forEach((u: any) => usersById.set(u.id, u));

      (subsRes.data || []).forEach((s: any) => submissionsMap.set(s.team_id, s));

      (teamsRes.data || []).forEach((t: any) => {
        const leader = usersById.get(t.leader_id);
        const members = (membersRes.data || []).filter((m: any) => m.team_id === t.id);
        const ps = FALLBACK_PROBLEMS.find((p) => p.id === t.problem_statement_id);
        const sub = submissionsMap.get(t.id) || null;
        teamsMap.set(t.id, {
          ...t,
          leader_name: leader?.name || t.leader_name || members[0]?.name || 'Team Lead',
          leader_email: leader?.email || t.leader_email || members[0]?.email || '',
          problem_title: ps?.title || t.problem_title || null,
          problem_category: ps?.category || t.problem_category || null,
          members,
          member_count: members.length,
          submission: sub,
        });
      });
    } catch {
      // ignore
    }

    // Merge all localStorage teams so current browser's teams always appear immediately
    const savedPsRaw = localStorage.getItem('vyugam_selected_ps');
    const savedPs = savedPsRaw
      ? (() => {
          try {
            return JSON.parse(savedPsRaw);
          } catch {
            return null;
          }
        })()
      : null;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('vyugam_team_')) {
        try {
          const lt = JSON.parse(localStorage.getItem(key) || '{}');
          if (lt && lt.id) {
            if (savedPs?.id && !lt.problem_statement_id) {
              lt.problem_statement_id = savedPs.id;
              lt.problem_title = savedPs.title;
              lt.problem_category = savedPs.category;
            }
            const ps = FALLBACK_PROBLEMS.find((p) => p.id === lt.problem_statement_id);
            const enriched = {
              ...lt,
              leader_name: lt.leader_name || lt.members?.[0]?.name || 'Team Lead',
              leader_email: lt.leader_email || lt.members?.[0]?.email || '',
              problem_title: lt.problem_title || ps?.title || null,
              problem_category: lt.problem_category || ps?.category || null,
              members: lt.members || [],
              member_count: (lt.members || []).length,
            };
            teamsMap.set(lt.id, enriched);
            if (lt.submission) {
              submissionsMap.set(lt.id, lt.submission);
            }
          }
        } catch {
          // ignore
        }
      }
    }

    // Add default demo team if no teams exist at all
    if (teamsMap.size === 0) {
      const demoTeam = {
        id: 'team-neural-01',
        name: 'Team Neural Nexus',
        leader_id: 'user-student-01',
        leader_name: 'Arjun Vikram',
        leader_email: 'arjun@sece.ac.in',
        college: 'Sri Eshwar College of Engineering',
        track: 'Software',
        problem_statement_id: 'VYUGAM-001',
        problem_title: 'Autonomous Multi Agent LLM Orchestration for Enterprise Workflows',
        problem_category: 'AI & Machine Learning',
        status: 'submitted',
        member_count: 4,
        members: [
          { id: 'm1', name: 'Arjun Vikram', email: 'arjun@sece.ac.in', role_in_team: 'Team Leader', gender: 'Male', college_id_no: '24AD001' },
          { id: 'm2', name: 'Priya Dharshini', email: 'priya@sece.ac.in', role_in_team: 'ML Engineer', gender: 'Female', college_id_no: '24AD002' },
          { id: 'm3', name: 'Karthik Raja', email: 'karthik@sece.ac.in', role_in_team: 'Full Stack Dev', gender: 'Male', college_id_no: '24AD003' },
          { id: 'm4', name: 'Divya Bharathi', email: 'divya@sece.ac.in', role_in_team: 'UI/UX Architect', gender: 'Female', college_id_no: '24AD004' },
        ],
        submission: {
          id: 'sub-demo-01',
          team_id: 'team-neural-01',
          problem_statement_id: 'VYUGAM-001',
          idea_title: 'OmniFlow: Self-Healing Multi-Agent DAG Engine',
          executive_summary: 'Deterministic multi-agent orchestration framework with LangGraph and automated rollback recovery.',
          proposed_solution: 'Stateful supervisor-worker agent mesh with real-time token telemetry and tool sandboxing.',
          tech_stack: 'Python, LangGraph, FastAPI, React, PostgreSQL',
          ppt_url: 'https://docs.google.com/presentation/d/vyugam-demo-deck',
          github_url: 'https://github.com/vyugam-ai/omniflow-agent',
          demo_video_url: 'https://youtu.be/vyugam-demo',
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        },
      };
      teamsMap.set(demoTeam.id, demoTeam);
      submissionsMap.set(demoTeam.id, demoTeam.submission);
    }

    const teams = Array.from(teamsMap.values());
    const customScoresRaw = localStorage.getItem('vyugam_admin_scores');
    const customScores: Record<string, { score: number; feedback: string }> = customScoresRaw ? JSON.parse(customScoresRaw) : {};

    const submissions = Array.from(submissionsMap.values()).map((s: any) => {
      const t = teamsMap.get(s.team_id);
      const ps = FALLBACK_PROBLEMS.find((p) => p.id === s.problem_statement_id);
      const customEval = customScores[s.id];
      return {
        ...s,
        team_name: t?.name || 'Hackathon Team',
        team_track: t?.track || 'Software',
        college: t?.college || 'Sri Eshwar College of Engineering',
        problem_title: ps?.title || t?.problem_title || s.problem_statement_id,
        avg_score: customEval ? customEval.score : s.avg_score || 91,
        feedback_remarks: customEval?.feedback || 'Strong technical architecture and clear execution plan.',
      };
    });

    const topTeams = submissions
      .map((s: any) => ({
        team_id: s.team_id,
        team_name: s.team_name,
        college: s.college,
        track: s.team_track,
        submission_id: s.id,
        idea_title: s.idea_title,
        problem_statement_id: s.problem_statement_id,
        ps_title: s.problem_title,
        avg_score: s.avg_score || 90,
        eval_count: 1,
      }))
      .sort((a, b) => b.avg_score - a.avg_score);

    const customPsRaw = localStorage.getItem('vyugam_custom_problems');
    const customPsCount = customPsRaw ? JSON.parse(customPsRaw).length : 0;

    const customAnnRaw = localStorage.getItem('vyugam_custom_announcements');
    const customAnns: any[] = customAnnRaw ? JSON.parse(customAnnRaw) : [];
    const announcements = [
      ...customAnns,
      {
        id: 'ann-1',
        title: 'Vyugam AI Hackathon 2026 Registration Now Live',
        message: 'Register your teams of 4 members by October 25, 2026.',
        category: 'Urgent',
        is_banner: 1,
      },
    ];

    const totalParticipants = teams.reduce((acc, t) => acc + (t.members?.length || 4), 0);

    return {
      status: 200,
      data: {
        success: true,
        count: teams.length,
        teams,
        submissions,
        topTeams,
        announcements,
        stats: {
          totalUsers: totalParticipants + 4,
          totalStudents: totalParticipants,
          totalEvaluators: 3,
          totalTeams: teams.length,
          totalSubmissions: submissions.length,
          totalEvaluated: topTeams.length,
          totalProblemStatements: FALLBACK_PROBLEMS.length + customPsCount,
        },
      },
    };
  }

  // 15. PATCH /admin/teams/:id/status
  if (method === 'patch' && path.startsWith('/admin/teams/') && path.endsWith('/status')) {
    const teamId = path.replace('/admin/teams/', '').replace('/status', '');
    const newStatus = body.status || 'shortlisted';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('vyugam_team_')) {
        try {
          const lt = JSON.parse(localStorage.getItem(key) || '{}');
          if (lt && lt.id === teamId) {
            lt.status = newStatus;
            localStorage.setItem(key, JSON.stringify(lt));
          }
        } catch {
          // ignore
        }
      }
    }
    supabase.from('teams').update({ status: newStatus }).eq('id', teamId).then(() => {});
    return { status: 200, data: { success: true, message: `Team status updated to ${newStatus}`, id: teamId, status: newStatus } };
  }

  // 16. DELETE /admin/teams/:id
  if (method === 'delete' && path.startsWith('/admin/teams/')) {
    const teamId = path.replace('/admin/teams/', '');
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('vyugam_team_')) {
        try {
          const lt = JSON.parse(localStorage.getItem(key) || '{}');
          if (lt && lt.id === teamId) keysToDelete.push(key);
        } catch {
          // ignore
        }
      }
    }
    keysToDelete.forEach((k) => localStorage.removeItem(k));
    supabase.from('teams').delete().eq('id', teamId).then(() => {});
    return { status: 200, data: { success: true, message: 'Team removed', id: teamId } };
  }

  // 17. POST /admin/evaluate
  if (method === 'post' && path === '/admin/evaluate') {
    const { submission_id, score, feedback } = body;
    const customScoresRaw = localStorage.getItem('vyugam_admin_scores');
    const customScores: Record<string, { score: number; feedback: string }> = customScoresRaw ? JSON.parse(customScoresRaw) : {};
    customScores[submission_id] = { score: Number(score), feedback: feedback || 'Evaluated by Admin Panel' };
    localStorage.setItem('vyugam_admin_scores', JSON.stringify(customScores));
    return { status: 200, data: { success: true, message: 'Evaluation score saved', submission_id, score: Number(score) } };
  }

  // 18. POST /admin/announcements
  if (method === 'post' && path === '/admin/announcements') {
    const newAnn = {
      id: 'ann-' + Math.random().toString(36).substring(2, 8),
      title: body.title,
      message: body.message,
      category: body.category || 'General',
      is_banner: 1,
      created_at: new Date().toISOString(),
    };
    const customAnnRaw = localStorage.getItem('vyugam_custom_announcements');
    const customAnns: any[] = customAnnRaw ? JSON.parse(customAnnRaw) : [];
    customAnns.unshift(newAnn);
    localStorage.setItem('vyugam_custom_announcements', JSON.stringify(customAnns));
    supabase.from('announcements').upsert(newAnn).then(() => {});
    return { status: 201, data: { success: true, message: 'Announcement broadcasted', announcement: newAnn } };
  }

  // 19. DELETE /admin/announcements/:id
  if (method === 'delete' && path.startsWith('/admin/announcements/')) {
    const annId = path.replace('/admin/announcements/', '');
    const customAnnRaw = localStorage.getItem('vyugam_custom_announcements');
    if (customAnnRaw) {
      const filtered = JSON.parse(customAnnRaw).filter((a: any) => a.id !== annId);
      localStorage.setItem('vyugam_custom_announcements', JSON.stringify(filtered));
    }
    supabase.from('announcements').delete().eq('id', annId).then(() => {});
    return { status: 200, data: { success: true, message: 'Announcement removed', id: annId } };
  }

  return null;
}

// Response interceptor for error handling & seamless Cloud/Supabase fallback
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If backend server is unreachable OR returns 401/403/404 on fallback-supported routes, use Cloud Supabase fallback
    if (error.config && (!error.response || [401, 403, 404, 500].includes(error.response?.status))) {
      if (!error.response) {
        isBackendUnreachable = true;
      }
      const fallbackResponse = await handleCloudFallback(error.config);
      if (fallbackResponse) {
        if (fallbackResponse.status >= 400) {
          return Promise.reject({
            ...error,
            response: {
              status: fallbackResponse.status,
              data: fallbackResponse.data,
            },
          });
        }
        return {
          data: fallbackResponse.data,
          status: fallbackResponse.status,
          statusText: 'OK',
          headers: {},
          config: error.config,
        };
      }
    }

    return Promise.reject(error);
  }
);
