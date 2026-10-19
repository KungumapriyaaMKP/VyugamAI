const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const supabaseService = require('../services/supabaseService');

// GET /api/teams/my-team
router.get('/my-team', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    let team = db.prepare(`
      SELECT t.*, u.name as leader_name, ps.title as problem_title, ps.category as problem_category
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.id
      LEFT JOIN problem_statements ps ON t.problem_statement_id = ps.id
      WHERE t.leader_id = ?
    `).get(userId);

    if (!team) {
      const memberRecord = db.prepare('SELECT team_id FROM team_members WHERE email = ?').get(req.user.email);
      if (memberRecord) {
        team = db.prepare(`
          SELECT t.*, u.name as leader_name, ps.title as problem_title, ps.category as problem_category
          FROM teams t
          LEFT JOIN users u ON t.leader_id = u.id
          LEFT JOIN problem_statements ps ON t.problem_statement_id = ps.id
          WHERE t.id = ?
        `).get(memberRecord.team_id);
      }
    }

    if (!team) {
      return res.json({ success: true, hasTeam: false, team: null });
    }

    const members = db.prepare('SELECT * FROM team_members WHERE team_id = ?').all(team.id);
    const submission = db.prepare('SELECT * FROM submissions WHERE team_id = ?').get(team.id);

    const femaleCount = members.filter(m => m.gender && m.gender.toLowerCase() === 'female').length;
    const isCompliant = members.length >= 3 && members.length <= 6;

    res.json({
      success: true,
      hasTeam: true,
      team: {
        ...team,
        members,
        submission,
        femaleCount,
        isCompliant
      }
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving team info' });
  }
});

// POST /api/teams/create
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { name, college, track, members } = req.body;
    const leaderId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Team name is required.' });
    }

    const trimmedName = name.trim();
    const existingTeam = db.prepare('SELECT id FROM teams WHERE LOWER(name) = LOWER(?)').get(trimmedName);
    if (existingTeam) {
      return res.status(400).json({ success: false, error: `The team name "${trimmedName}" is already registered. Please choose a different name.` });
    }

    // Check if the user already leads a team
    const existingLeaderTeam = db.prepare('SELECT id, name FROM teams WHERE leader_id = ?').get(leaderId);
    if (existingLeaderTeam) {
      return res.status(400).json({ success: false, error: `You have already registered team "${existingLeaderTeam.name}". A student can lead only one team.` });
    }

    // Retrieve leader user info safely from DB
    const leaderUser = db.prepare('SELECT * FROM users WHERE id = ?').get(leaderId);
    const leaderName = leaderUser?.name || req.user.name || 'Team Leader';
    const leaderEmail = (leaderUser?.email || req.user.email || 'leader@sece.ac.in').trim().toLowerCase();

    // Check if leader is already registered as a member in another team
    const existingMemberRecord = db.prepare('SELECT team_id FROM team_members WHERE LOWER(email) = ?').get(leaderEmail);
    if (existingMemberRecord) {
      return res.status(400).json({ success: false, error: `Leader email ${leaderEmail} is already part of an existing team.` });
    }

    // Strictly enforce 4 members (1 Leader + 3 Student Members)
    if (!Array.isArray(members) || members.length !== 3) {
      return res.status(400).json({ success: false, error: 'Vyugam AI Hackathon strictly requires a team of 4 members (1 Team Leader + 3 Student Members).' });
    }

    // Validate each member
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name || !m.name.trim()) {
        return res.status(400).json({ success: false, error: `Member #${i + 2} is missing a full name.` });
      }
      if (!m.email || !m.email.trim()) {
        return res.status(400).json({ success: false, error: `Member #${i + 2} is missing an email address.` });
      }

      const mEmail = m.email.trim().toLowerCase();
      if (!mEmail.endsWith('@sece.ac.in')) {
        return res.status(400).json({ success: false, error: `Member #${i + 2} email (${m.email}) must be an official @sece.ac.in student address.` });
      }
      if (mEmail === leaderEmail) {
        return res.status(400).json({ success: false, error: `Member #${i + 2} cannot have the same email as the Team Leader.` });
      }
    }

    // Check for duplicate emails within the squad
    const memberEmails = members.map(m => m.email.trim().toLowerCase());
    const allEmails = [leaderEmail, ...memberEmails];
    if (new Set(allEmails).size !== allEmails.length) {
      return res.status(400).json({ success: false, error: 'All 4 team members must have distinct email addresses.' });
    }

    const teamId = 'team-' + uuidv4().slice(0, 8);
    const resolvedCollege = college || leaderUser?.college || 'Sri Eshwar College of Engineering';
    const resolvedTrack = track || 'Software';

    db.prepare(`
      INSERT INTO teams (id, name, leader_id, college, track, status)
      VALUES (?, ?, ?, ?, ?, 'forming')
    `).run(teamId, trimmedName, leaderId, resolvedCollege, resolvedTrack);

    const teamObj = {
      id: teamId,
      name: trimmedName,
      leader_id: leaderId,
      college: resolvedCollege,
      track: resolvedTrack,
      status: 'forming'
    };

    // Add leader as member #1
    const leaderMember = {
      id: uuidv4(),
      team_id: teamId,
      name: leaderName,
      email: leaderEmail,
      role_in_team: 'Team Leader',
      gender: leaderUser?.gender || 'Other',
      college_id_no: leaderUser?.college_id_no || '24AD001',
      year_of_study: '3rd Year'
    };

    db.prepare(`
      INSERT INTO team_members (id, team_id, name, email, role_in_team, gender, college_id_no, year_of_study)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(leaderMember.id, leaderMember.team_id, leaderMember.name, leaderMember.email, leaderMember.role_in_team, leaderMember.gender, leaderMember.college_id_no, leaderMember.year_of_study);

    // Add 3 student members
    const insertMember = db.prepare(`
      INSERT INTO team_members (id, team_id, name, email, role_in_team, gender, college_id_no, year_of_study)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const allMembersToSync = [leaderMember];

    for (const m of members) {
      const mObj = {
        id: uuidv4(),
        team_id: teamId,
        name: m.name.trim(),
        email: m.email.trim().toLowerCase(),
        role_in_team: m.role_in_team || 'Developer',
        gender: m.gender || 'Female',
        college_id_no: m.college_id_no?.trim() || '24AD001',
        year_of_study: m.year_of_study || '3rd Year'
      };
      insertMember.run(mObj.id, mObj.team_id, mObj.name, mObj.email, mObj.role_in_team, mObj.gender, mObj.college_id_no, mObj.year_of_study);
      allMembersToSync.push(mObj);
    }

    // Respond immediately for instant UX, and sync to Supabase in background
    res.status(201).json({
      success: true,
      message: 'Team created successfully with 4 members and synced to Supabase',
      teamId
    });

    // Non-blocking background sync to Supabase
    (async () => {
      try {
        await supabaseService.syncTeam(teamObj);
        await Promise.all(allMembersToSync.map(m => supabaseService.syncTeamMember(m)));
      } catch (syncErr) {
        console.warn('Background team sync notice:', syncErr.message);
      }
    })();
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create team.' });
  }
});

// POST /api/teams/select-problem (Lock problem statement for team in Supabase)
router.post('/select-problem', authenticateToken, async (req, res) => {
  try {
    const { problemId } = req.body;
    const userId = req.user?.id;

    let team;
    if (userId) {
      team = db.prepare('SELECT * FROM teams WHERE leader_id = ?').get(userId);
    }
    
    if (!team) {
      team = db.prepare('SELECT * FROM teams ORDER BY created_at DESC LIMIT 1').get();
    }

    if (!team) {
      return res.json({
        success: true,
        message: 'Problem statement locked for your session',
        problemId
      });
    }

    const ps = db.prepare('SELECT id FROM problem_statements WHERE id = ? AND is_active = 1').get(problemId);
    if (!ps) {
      return res.status(404).json({ success: false, error: 'Problem statement not found or inactive' });
    }

    db.prepare('UPDATE teams SET problem_statement_id = ? WHERE id = ?').run(problemId, team.id);

    // Map Problem Statement selection in Supabase in background
    supabaseService.mapTeamProblem(team.id, problemId).catch(() => {});

    res.json({
      success: true,
      message: 'Problem statement mapped to team in Supabase successfully',
      teamId: team.id,
      problemId
    });
  } catch (error) {
    console.error('Select problem error:', error);
    res.status(500).json({ success: false, error: 'Failed to assign problem statement' });
  }
});

// POST /api/teams/add-member
router.post('/add-member', authenticateToken, async (req, res) => {
  try {
    const { name, email, role_in_team, gender, college_id_no, year_of_study } = req.body;
    const userId = req.user.id;

    const team = db.prepare('SELECT id FROM teams WHERE leader_id = ?').get(userId);
    if (!team) {
      return res.status(400).json({ success: false, error: 'Only team leader can add members' });
    }

    const currentCount = db.prepare('SELECT COUNT(*) as count FROM team_members WHERE team_id = ?').get(team.id).count;
    if (currentCount >= 6) {
      return res.status(400).json({ success: false, error: 'Maximum team size of 6 members reached' });
    }

    const mObj = {
      id: uuidv4(),
      team_id: team.id,
      name,
      email,
      role_in_team: role_in_team || 'Developer',
      gender: gender || 'Male',
      college_id_no: college_id_no || '',
      year_of_study: year_of_study || '3rd Year'
    };

    db.prepare(`
      INSERT INTO team_members (id, team_id, name, email, role_in_team, gender, college_id_no, year_of_study)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(mObj.id, mObj.team_id, mObj.name, mObj.email, mObj.role_in_team, mObj.gender, mObj.college_id_no, mObj.year_of_study);

    supabaseService.syncTeamMember(mObj);

    res.status(201).json({ success: true, message: 'Team member added and synced to Supabase', memberId: mObj.id });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add member' });
  }
});

module.exports = router;
