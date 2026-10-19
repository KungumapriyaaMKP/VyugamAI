const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const sampleUsers = [
  {
    id: 'user-admin-01',
    name: 'Dr. A. R. Sharma (Hackathon Chair)',
    email: 'admin@sece.ac.in',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    college: 'Sri Eshwar College of Engineering',
    department: 'AI & Data Science Department',
    phone: '+91 98765 43210'
  },
  {
    id: 'user-eval-01',
    name: 'Prof. Meera Nair (AI Expert)',
    email: 'meera.evaluator@sece.ac.in',
    password: bcrypt.hashSync('eval123', 10),
    role: 'evaluator',
    college: 'Sri Eshwar College of Engineering',
    department: 'Department of Computer Science',
    phone: '+91 98765 11223'
  },
  {
    id: 'user-eval-02',
    name: 'Dr. Rajesh Kumar (Cybersecurity Lead)',
    email: 'rajesh.evaluator@sece.ac.in',
    password: bcrypt.hashSync('eval123', 10),
    role: 'evaluator',
    college: 'Sri Eshwar College of Engineering',
    department: 'Cybersecurity Wing',
    phone: '+91 98765 44332'
  },
  {
    id: 'user-student-01',
    name: 'Arjun Vikram (Team Lead)',
    email: 'arjun@sece.ac.in',
    password: bcrypt.hashSync('student123', 10),
    role: 'student',
    college: 'Sri Eshwar College of Engineering',
    department: 'Computer Science',
    phone: '+91 91234 56789'
  },
  {
    id: 'user-student-02',
    name: 'Kungumapriyaa M',
    email: 'kungumapriyaa.m2024aids@sece.ac.in',
    password: bcrypt.hashSync('123456', 10),
    role: 'student',
    college: 'Sri Eshwar College of Engineering',
    department: 'Department of AI & DS',
    phone: '+91 98765 00001'
  }
];

const sampleProblemStatements = [
  {
    id: 'VYUGAM-001',
    title: 'AI Driven Autonomous Campus Energy Optimization System',
    category: 'AI & Machine Learning',
    domain_bucket: 'Software',
    organization: 'Ministry of Education: Renewable Energy Wing',
    description: 'Develop an intelligent machine learning algorithm to predict campus electricity load based on timetable, weather, and occupancy sensors, optimizing solar inverter switching and reducing HVAC power consumption by up to 30%.',
    desired_outcome: 'Interactive dashboard with real time sensor telemetry ingestion, predictive load graph, automated relay switching commands, and dynamic cost analytics.',
    complexity: 'Hard',
    dataset_url: 'https://github.com/vyugam-ai/campus-energy-dataset'
  },
  {
    id: 'VYUGAM-002',
    title: 'Deepfake Video Detection and Forensics for Academic Verification',
    category: 'Cybersecurity',
    domain_bucket: 'Software',
    organization: 'Department of Computer Science and Security',
    description: 'Build a multi modal deep neural network to detect generative deepfake media in student identity submissions, remote exams, and official certificates using spatial temporal facial inconsistency analysis.',
    desired_outcome: 'RESTful API and web app that outputs confidence score, heatmap of tampered frames, and downloadable PDF forensic report.',
    complexity: 'Hard',
    dataset_url: 'https://github.com/vyugam-ai/deepfake-forensics-data'
  },
  {
    id: 'VYUGAM-003',
    title: 'Smart Health Monitoring Wearable with On Device Edge ML',
    category: 'IoT & Robotics',
    domain_bucket: 'Both',
    organization: 'Vyugam Healthcare & Bio-Engineering Cell',
    description: 'Design a low cost wearable patch with microcontrollers running tinyML models to detect early cardiac arrhythmia and hypoxia in real time without continuous internet connection.',
    desired_outcome: 'Hardware schematic, embedded C firmware, Bluetooth low energy mobile app, and cloud sync protocol.',
    complexity: 'Medium',
    dataset_url: 'https://github.com/vyugam-ai/ecg-arrhythmia-signals'
  },
  {
    id: 'VYUGAM-004',
    title: 'Blockchain Based Decentralized Academic Credentials & Verification',
    category: 'Blockchain & FinTech',
    domain_bucket: 'Software',
    organization: 'Vyugam Registrar & Academic Council',
    description: 'Implement a zero knowledge proof enabled Ethereum smart contract framework to issue tamper proof digital degrees and mark sheets, allowing instant verification by employers worldwide.',
    desired_outcome: 'Deployed smart contracts, issuer portal, student wallet interface, and one click employer verification QR system.',
    complexity: 'Medium',
    dataset_url: 'https://github.com/vyugam-ai/zk-credentials-contracts'
  },
  {
    id: 'VYUGAM-005',
    title: 'Adaptive AI Tutor for Multilingual Regional Language Education',
    category: 'EdTech & Social Innovation',
    domain_bucket: 'Software',
    organization: 'National Language Mission & Vyugam AI Lab',
    description: 'Construct a voice enabled adaptive tutoring assistant in Tamil, Hindi, Telugu, and English that converts STEM curriculum into interactive conversational modules for rural students.',
    desired_outcome: 'Web and mobile app with voice input, real time audio synthesis, gamified quiz generation, and offline caching support.',
    complexity: 'Easy',
    dataset_url: 'https://github.com/vyugam-ai/indic-stem-corpus'
  },
  {
    id: 'VYUGAM-006',
    title: 'Real Time Traffic Flow Management and Emergency Vehicle Prioritization',
    category: 'Smart Healthcare',
    domain_bucket: 'Both',
    organization: 'Smart City Cell & Municipal Transport',
    description: 'Create an intelligent computer vision pipeline utilizing existing CCTV camera feeds to dynamically control green signal durations and carve out emergency corridors for ambulances.',
    desired_outcome: 'YOLOv8 vehicle tracking pipeline, dynamic signal controller simulator, and ambulance routing mobile app.',
    complexity: 'Hard',
    dataset_url: 'https://github.com/vyugam-ai/traffic-cctv-dataset'
  },
  {
    id: 'VYUGAM-007',
    title: 'Automated Code Vulnerability Repair with Large Language Models',
    category: 'AI & Machine Learning',
    domain_bucket: 'Software',
    organization: 'Vyugam Cyber Defense Lab',
    description: 'Develop a specialized coding assistant LLM agent that scans source repositories for OWASP Top 10 security bugs, generates patch diffs, and writes automated regression unit tests.',
    desired_outcome: 'VS Code plugin and CLI tool with automated pull request creation and patch verification engine.',
    complexity: 'Hard',
    dataset_url: 'https://github.com/vyugam-ai/security-patches-benchmark'
  },
  {
    id: 'VYUGAM-008',
    title: 'Precision Agriculture Soil Moisture & Crop Disease Detection Drone System',
    category: 'Clean Energy & Sustainability',
    domain_bucket: 'Both',
    organization: 'AgriTech Innovation Center',
    description: 'Combine multispectral aerial camera imagery with IoT soil sensors to deliver micro level irrigation maps and early fungal infection alerts to local farmers via SMS.',
    desired_outcome: 'Drone ground control software, plant disease computer vision classifier, and low bandwidth SMS alert server.',
    complexity: 'Medium',
    dataset_url: 'https://github.com/vyugam-ai/crop-multispectral-data'
  }
];

const sampleAnnouncements = [
  {
    id: 'ann-1',
    title: 'Vyugam AI Hackathon 2026 Registration Now Live',
    message: 'Register your teams of 4 members by October 25, 2026. Female participation is strongly encouraged!',
    category: 'Urgent',
    is_banner: 1
  },
  {
    id: 'ann-2',
    title: 'Problem Statement Selection Open for All Verified Teams',
    message: 'Explore the 8 multidisciplinary problem statements and lock your choices before the initial draft submission deadline.',
    category: 'General',
    is_banner: 0
  },
  {
    id: 'ann-3',
    title: 'Grand Finale Prize Pool Announced: INR 5,00,000 + Incubation Support',
    message: 'Top 3 winners across hardware and software tracks will receive direct entry into Vyugam Incubation Hub and mentorship from industry leaders.',
    category: 'General',
    is_banner: 0
  }
];

module.exports = {
  sampleUsers,
  sampleProblemStatements,
  sampleAnnouncements
};
