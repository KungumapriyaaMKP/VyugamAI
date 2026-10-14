const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');

// GET /api/public/announcements (Public ticker & banners)
router.get('/announcements', (req, res) => {
  try {
    const announcements = db.prepare('SELECT * FROM announcements ORDER BY created_at DESC LIMIT 10').all();
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch announcements' });
  }
});

// GET /api/public/live-stats (Public stats banner: total teams, PS count, prize pool)
router.get('/live-stats', (req, res) => {
  try {
    const dbTeams = db.prepare('SELECT COUNT(*) as count FROM teams').get()?.count || 0;
    const dbStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get()?.count || 0;
    const dbMembers = db.prepare('SELECT COUNT(*) as count FROM team_members').get()?.count || 0;
    const dbPS = db.prepare('SELECT COUNT(*) as count FROM problem_statements').get()?.count || 8;
    const dbSubmissions = db.prepare('SELECT COUNT(*) as count FROM submissions').get()?.count || 0;

    const totalStudents = (dbStudents + dbMembers) > 0 ? (dbStudents + dbMembers) : 150;
    const totalTeams = dbTeams > 0 ? dbTeams : 40;
    const totalProblemStatements = dbPS > 0 ? dbPS : 8;

    res.json({
      success: true,
      stats: {
        totalTeams,
        totalSubmissions: dbSubmissions,
        totalStudents,
        totalProblemStatements,
        prizePool: '50000',
        collegesParticipating: '1'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch live stats' });
  }
});

// GET /api/public/pages/about (Dedicated About Us page content)
router.get('/pages/about', (req, res) => {
  try {
    res.json({
      success: true,
      page: {
        slug: 'about',
        title: 'Why VyugamAI?',
        badge: 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE',
        institution: 'Sri Eshwar College of Engineering',
        headline: 'Ideas × Intelligence × Impact',
        paragraphs: [
          'VyugamAI is our premier internal innovation hackathon, organized exclusively for the students of Sri Eshwar College of Engineering by the Department of Artificial Intelligence & Data Science. Conceived to cultivate an active culture of campus innovation and hands-on problem-solving, VyugamAI offers our students a dedicated platform to engineer breakthrough solutions for real-world and campus challenges. By encouraging critical inquiry and collaborative creativity, the hackathon bridges classroom theory with industry-grade software, hardware, and AI development.',
          'Open to students across all engineering branches and academic years, VyugamAI empowers participants to form interdisciplinary teams, ideate boldly, and build functional prototypes under direct faculty and industry mentorship. The initiative serves as a launchpad for practical skills, portfolio enhancement, and project incubation right here at Sri Eshwar, preparing our students to lead and excel in modern technology ecosystems.'
        ],
        mission: 'To cultivate a campus-wide hub of deep-tech innovation where Sri Eshwar engineering students transform conceptual AI and engineering theories into tangible, high-impact solutions.',
        vision: 'To pioneer student-driven research, collaboration, and entrepreneurship across all departments at Sri Eshwar College of Engineering.',
        pillars: [
          {
            title: 'Practical Problem Solving',
            desc: 'Tackling real-world challenges curated by industry pioneers, faculty mentors, and social initiatives.',
            tag: 'Real-world Focus'
          },
          {
            title: 'Industry & Faculty Mentorship',
            desc: 'Direct interaction and guidance from senior AI researchers, tech leads, and faculty experts.',
            tag: 'Expert Mentorship'
          },
          {
            title: 'Incubation & Grand Prizes',
            desc: 'Cash awards, project incubation pathways, and campus intellectual property support for winning teams.',
            tag: 'Ecosystem Backing'
          }
        ],
        highlights: [
          { label: 'Organized By', value: 'Dept. of AI & Data Science' },
          { label: 'Host Institution', value: 'Sri Eshwar College of Engineering' },
          { label: 'Eligibility', value: 'SECE Students (All Departments & Years)' },
          { label: 'Finale Format', value: '24-Hour Offline Hackathon' }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch about page' });
  }
});

// GET /api/public/pages/process (Dedicated Project Implementation & Roadmap page content)
router.get('/pages/process', (req, res) => {
  try {
    res.json({
      success: true,
      page: {
        slug: 'process',
        title: 'Project Implementation & Roadmap',
        subtitle: 'From Idea Inception to the 24-Hour Physical Grand Finale',
        phases: [
          {
            step: 'Phase 01',
            title: 'Team Formation & Idea Submission',
            date: 'Extended: 25th October 2026',
            status: 'Active',
            desc: 'Form teams of exactly 4 students, choose a problem statement, and upload your PPT proposal highlighting problem definition, proposed AI/Tech architecture, and feasibility.'
          },
          {
            step: 'Phase 02',
            title: 'Round 1 Jury Screening & Shortlisting',
            date: 'Early November 2026',
            status: 'Upcoming',
            desc: 'Blind evaluation by internal and external academic juries to select top teams per track based on originality and algorithmic rigor.'
          },
          {
            step: 'Phase 03',
            title: 'Virtual Mentorship & Prototype Build',
            date: 'Late November 2026',
            status: 'Upcoming',
            desc: '1-on-1 virtual mentoring clinics with industry specialists to refine system architectures, datasets, and API integrations.'
          },
          {
            step: 'Phase 04',
            title: 'Grand Finale (24-Hour Offline Hackathon)',
            date: 'December 2026 / January 2027',
            status: 'Grand Finale',
            desc: 'Top finalist teams assemble on campus at Sri Eshwar College of Engineering for live coding, continuous jury reviews, and stage demos.'
          }
        ],
        rubrics: [
          { criteria: 'Originality & Innovation', weight: '25%' },
          { criteria: 'AI & Technical Complexity', weight: '25%' },
          { criteria: 'Practical Feasibility & Scalability', weight: '20%' },
          { criteria: 'UI/UX & User Experience', weight: '15%' },
          { criteria: 'Demo Defense & Q&A Pitch', weight: '15%' }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch process page' });
  }
});

// GET /api/public/pages/faq (Dedicated FAQs page content)
router.get('/pages/faq', (req, res) => {
  try {
    res.json({
      success: true,
      page: {
        slug: 'faq',
        title: "Got Questions? We've Got Answers.",
        subtitle: 'Everything you need to know about VyugamAI 2026 participation, team rules, and timelines.',
        categories: ['All', 'General', 'Teams & Eligibility', 'Submissions & Rules', 'Grand Finale'],
        faqs: [
          {
            category: 'General',
            question: 'What is VyugamAI 2026?',
            answer: 'VyugamAI 2026 is a premier national innovation hackathon organized by the Department of Artificial Intelligence and Data Science at Sri Eshwar College of Engineering, challenging students to build breakthrough AI, software, and hardware solutions.'
          },
          {
            category: 'Teams & Eligibility',
            question: 'What is the team size and composition?',
            answer: 'Each team must consist of exactly 4 members (1 Team Leader + 3 Members). Inter-departmental and inter-year teams within Sri Eshwar College of Engineering are enthusiastically encouraged.'
          },
          {
            category: 'Teams & Eligibility',
            question: 'Who is eligible to participate?',
            answer: 'All undergraduate and postgraduate students of Sri Eshwar College of Engineering across all engineering, technology, and computer science departments.'
          },
          {
            category: 'Submissions & Rules',
            question: 'What is the PPT submission format?',
            answer: 'Submissions must include problem statement code, executive summary, methodology flowchart, dataset/architecture schema, and expected impact using the official VyugamAI template.'
          },
          {
            category: 'General',
            question: 'Is there any registration fee?',
            answer: 'Initial round registration and proposal submission is completely free. Shortlisted finalists will receive accommodation and amenities at Sri Eshwar campus.'
          },
          {
            category: 'Grand Finale',
            question: 'Where will the Grand Finale take place?',
            answer: 'The Grand Finale is a 24-hour physical hackathon hosted at the state-of-the-art Innovation Center, Sri Eshwar College of Engineering, Coimbatore.'
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch faq page' });
  }
});

// GET /api/public/pages/contact (Dedicated Contact page content)
router.get('/pages/contact', (req, res) => {
  try {
    res.json({
      success: true,
      page: {
        slug: 'contact',
        title: 'Helpdesk & Contact Center',
        subtitle: 'Our organizing committee is here to assist with team nominations, registration, and queries.',
        headquarters: {
          campus: 'Sri Eshwar College of Engineering',
          center: 'Innovation Cell, Department of AI & DS, Block A',
          address: 'Kondampatti Post, Vadasithur via, Kinathukadavu',
          city: 'Coimbatore - 641 202, Tamil Nadu, India'
        },
        phone: '+91 94899 99999',
        email: 'hackathon@sece.ac.in',
        timings: 'Monday to Saturday: 9:00 AM – 7:00 PM IST',
        whatsappDesk: 'https://wa.me/919489999999'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch contact page' });
  }
});

// GET /api/public/pages/:slug (Dynamic dispatcher)
router.get('/pages/:slug', (req, res) => {
  const { slug } = req.params;
  const redirectMap = {
    'about': '/api/public/pages/about',
    'process': '/api/public/pages/process',
    'faq': '/api/public/pages/faq',
    'contact': '/api/public/pages/contact'
  };

  if (redirectMap[slug]) {
    return res.redirect(redirectMap[slug]);
  }

  res.status(404).json({ success: false, error: `Page '${slug}' not found` });
});

// POST /api/public/contact (Submit contact helpdesk message)
router.post('/contact', (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
    }

    const id = 'msg-' + uuidv4().slice(0, 8);
    db.prepare(`
      INSERT INTO contact_messages (id, name, email, subject, message)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, email, subject || 'General Query', message);

    res.status(201).json({ success: true, message: 'Message sent successfully. Our team will get back to you.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

module.exports = router;
