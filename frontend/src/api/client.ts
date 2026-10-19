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
      return { status: 400, data: { success: false, error: 'Email and password are required' } };
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
    if (currentUser) {
      const localTeamRaw = localStorage.getItem(`vyugam_team_${currentUser.email}`);
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
    return {
      status: 200,
      data: {
        success: true,
        announcements: [
          {
            id: 'ann-1',
            title: 'Vyugam AI Hackathon 2026 Registration Now Live',
            message: 'Register your teams of 4 members by October 25, 2026.',
            category: 'Urgent',
            is_banner: 1,
          },
        ],
      },
    };
  }

  return null;
}

// Response interceptor for error handling & seamless Cloud/Supabase fallback
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If backend server is unreachable (Network Error / timeout), mark it and use Cloud Supabase fallback
    if (!error.response && error.config) {
      isBackendUnreachable = true;
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

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('vyugam_token');
      localStorage.removeItem('vyugam_user');
    }
    return Promise.reject(error);
  }
);
