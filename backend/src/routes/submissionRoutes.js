const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const supabaseService = require('../services/supabaseService');

// POST /api/submissions/submit
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { idea_title, executive_summary, proposed_solution, tech_stack, ppt_url, github_url, demo_video_url } = req.body;
    const userId = req.user.id;

    const team = db.prepare('SELECT * FROM teams WHERE leader_id = ?').get(userId);
    if (!team) {
      return res.status(400).json({ success: false, error: 'You must be a team leader to submit an idea' });
    }

    if (!team.problem_statement_id) {
      return res.status(400).json({ success: false, error: 'Please select a problem statement before submitting' });
    }

    if (!idea_title || !executive_summary || !proposed_solution) {
      return res.status(400).json({ success: false, error: 'Idea title, executive summary, and proposed solution are required' });
    }

    const existingSubmission = db.prepare('SELECT id FROM submissions WHERE team_id = ?').get(team.id);

    let subId;
    if (existingSubmission) {
      subId = existingSubmission.id;
      db.prepare(`
        UPDATE submissions 
        SET idea_title = ?, executive_summary = ?, proposed_solution = ?, tech_stack = ?, ppt_url = ?, github_url = ?, demo_video_url = ?, status = 'submitted', submitted_at = CURRENT_TIMESTAMP
        WHERE team_id = ?
      `).run(idea_title, executive_summary, proposed_solution, tech_stack || '', ppt_url || '', github_url || '', demo_video_url || '', team.id);

      db.prepare("UPDATE teams SET status = 'submitted' WHERE id = ?").run(team.id);
    } else {
      subId = 'sub-' + uuidv4().slice(0, 8);
      db.prepare(`
        INSERT INTO submissions (id, team_id, problem_statement_id, idea_title, executive_summary, proposed_solution, tech_stack, ppt_url, github_url, demo_video_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted')
      `).run(subId, team.id, team.problem_statement_id, idea_title, executive_summary, proposed_solution, tech_stack || '', ppt_url || '', github_url || '', demo_video_url || '');

      db.prepare("UPDATE teams SET status = 'submitted' WHERE id = ?").run(team.id);
      db.prepare('UPDATE problem_statements SET submissions_count = submissions_count + 1 WHERE id = ?').run(team.problem_statement_id);
    }

    const subObj = {
      id: subId,
      team_id: team.id,
      problem_statement_id: team.problem_statement_id,
      idea_title,
      executive_summary,
      proposed_solution,
      tech_stack: tech_stack || '',
      ppt_url: ppt_url || '',
      github_url: github_url || '',
      demo_video_url: demo_video_url || '',
      status: 'submitted'
    };

    // Ensure team exists in Supabase, then sync proposal to Supabase
    const leaderUser = db.prepare('SELECT * FROM users WHERE id = ?').get(team.leader_id);
    const canonicalTeamId = await supabaseService.syncTeam({ ...team, status: 'submitted' }, leaderUser);
    await supabaseService.syncSubmission({ ...subObj, team_id: canonicalTeamId || team.id });

    return res.status(201).json({ success: true, message: 'Idea proposal submitted and synced to Supabase', submissionId: subId });
  } catch (error) {
    console.error('Error in submission:', error);
    res.status(500).json({ success: false, error: 'Failed to submit proposal: ' + error.message });
  }
});

// GET /api/submissions/my-submission
router.get('/my-submission', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const team = db.prepare('SELECT id FROM teams WHERE leader_id = ?').get(userId);
    if (!team) {
      return res.json({ success: true, submission: null });
    }

    const submission = db.prepare(`
      SELECT s.*, ps.title as ps_title, ps.category as ps_category, ps.organization as ps_organization
      FROM submissions s
      JOIN problem_statements ps ON s.problem_statement_id = ps.id
      WHERE s.team_id = ?
    `).get(team.id);

    res.json({ success: true, submission: submission || null });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch submission' });
  }
});

module.exports = router;
