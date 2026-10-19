const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const supabaseService = require('../services/supabaseService');

// GET /api/admin/stats (Comprehensive Hackathon Stats & Full Admin Dataset)
router.get('/stats', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get().count;
    const totalEvaluators = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'evaluator'").get().count;
    const totalTeams = db.prepare('SELECT COUNT(*) as count FROM teams').get().count;
    const totalSubmissions = db.prepare('SELECT COUNT(*) as count FROM submissions').get().count;
    const totalEvaluated = db.prepare('SELECT COUNT(DISTINCT submission_id) as count FROM evaluations').get().count;
    const totalProblemStatements = db.prepare('SELECT COUNT(*) as count FROM problem_statements WHERE is_active = 1').get().count;

    const categoryStats = db.prepare(`
      SELECT category, COUNT(*) as ps_count, SUM(submissions_count) as total_subs
      FROM problem_statements
      WHERE is_active = 1
      GROUP BY category
    `).all();

    const topTeams = db.prepare(`
      SELECT 
        t.id as team_id,
        t.name as team_name,
        t.college,
        t.track,
        s.id as submission_id,
        s.idea_title,
        s.problem_statement_id,
        ps.title as ps_title,
        AVG(e.total_score) as avg_score,
        COUNT(e.id) as eval_count
      FROM evaluations e
      JOIN submissions s ON e.submission_id = s.id
      JOIN teams t ON s.team_id = t.id
      LEFT JOIN problem_statements ps ON s.problem_statement_id = ps.id
      GROUP BY s.id
      ORDER BY avg_score DESC
      LIMIT 20
    `).all();

    const teamsRaw = db.prepare(`
      SELECT 
        t.*,
        u.name as leader_name,
        u.email as leader_email,
        u.phone as leader_phone,
        ps.title as problem_title,
        ps.category as problem_category
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.id
      LEFT JOIN problem_statements ps ON t.problem_statement_id = ps.id
      ORDER BY t.created_at DESC
    `).all();

    const teams = teamsRaw.map((t) => {
      const members = db.prepare('SELECT * FROM team_members WHERE team_id = ?').all(t.id);
      const submission = db.prepare('SELECT * FROM submissions WHERE team_id = ?').get(t.id) || null;
      return {
        ...t,
        members,
        member_count: members.length,
        submission,
      };
    });

    const submissions = db.prepare(`
      SELECT 
        s.*,
        t.name as team_name,
        t.track as team_track,
        t.college as college,
        ps.title as problem_title,
        (SELECT AVG(total_score) FROM evaluations e WHERE e.submission_id = s.id) as avg_score
      FROM submissions s
      LEFT JOIN teams t ON s.team_id = t.id
      LEFT JOIN problem_statements ps ON s.problem_statement_id = ps.id
      ORDER BY s.submitted_at DESC
    `).all();

    const announcements = db.prepare('SELECT * FROM announcements ORDER BY created_at DESC').all();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalEvaluators,
        totalTeams,
        totalSubmissions,
        totalEvaluated,
        totalProblemStatements,
      },
      categoryStats,
      topTeams,
      teams,
      submissions,
      announcements,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve admin statistics' });
  }
});

// GET /api/admin/teams (List all teams with member counts and statuses)
router.get('/teams', (req, res) => {
  try {
    const teamsRaw = db.prepare(`
      SELECT 
        t.*,
        u.name as leader_name,
        u.email as leader_email,
        ps.title as problem_title
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.id
      LEFT JOIN problem_statements ps ON t.problem_statement_id = ps.id
      ORDER BY t.created_at DESC
    `).all();

    const teams = teamsRaw.map((t) => {
      const members = db.prepare('SELECT * FROM team_members WHERE team_id = ?').all(t.id);
      const submission = db.prepare('SELECT * FROM submissions WHERE team_id = ?').get(t.id) || null;
      return {
        ...t,
        members,
        member_count: members.length,
        submission,
      };
    });

    res.json({ success: true, count: teams.length, teams });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch teams' });
  }
});

// PATCH /api/admin/teams/:id/status (Update team status: forming, submitted, shortlisted, winner)
router.patch('/teams/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }
    db.prepare('UPDATE teams SET status = ? WHERE id = ?').run(status, id);
    await supabaseService.updateTeamStatus(id, status);
    res.json({ success: true, message: `Team status updated to ${status} and synced to Supabase`, id, status });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update team status' });
  }
});

// DELETE /api/admin/teams/:id (Delete a team)
router.delete('/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subs = db.prepare('SELECT id FROM submissions WHERE team_id = ?').all(id);
    for (const s of subs) {
      db.prepare('DELETE FROM evaluations WHERE submission_id = ?').run(s.id);
    }
    db.prepare('DELETE FROM team_members WHERE team_id = ?').run(id);
    db.prepare('DELETE FROM submissions WHERE team_id = ?').run(id);
    db.prepare('DELETE FROM teams WHERE id = ?').run(id);
    await supabaseService.deleteTeam(id);
    res.json({ success: true, message: 'Team removed from database and Supabase', id });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete team' });
  }
});

// POST /api/admin/evaluate (Admin quick score/evaluation for a submission)
router.post('/evaluate', async (req, res) => {
  try {
    const { submission_id, score, feedback } = req.body;
    if (!submission_id || score === undefined) {
      return res.status(400).json({ success: false, error: 'Submission ID and score are required' });
    }
    const numScore = Math.max(0, Math.min(100, Number(score)));
    const part = Math.floor(numScore / 5);
    const remainder = numScore - part * 4;
    const adminUser = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get() ||
      db.prepare('SELECT id FROM users LIMIT 1').get();
    const evaluatorId = adminUser ? adminUser.id : 'user-admin-01';
    const commentsText = feedback || 'Evaluated by Admin Panel';
    const decisionText = numScore >= 60 ? 'Shortlist' : 'Under Review';

    const existing = db.prepare('SELECT id FROM evaluations WHERE submission_id = ?').get(submission_id);
    const evalId = existing ? existing.id : 'eval-' + uuidv4().slice(0, 8);

    if (existing) {
      db.prepare(`
        UPDATE evaluations
        SET innovation_score = ?, technical_score = ?, feasibility_score = ?, ui_ux_score = ?, presentation_score = ?, total_score = ?, comments = ?, decision = ?
        WHERE id = ?
      `).run(part, part, part, part, remainder, numScore, commentsText, decisionText, evalId);
    } else {
      db.prepare(`
        INSERT INTO evaluations (id, submission_id, evaluator_id, innovation_score, technical_score, feasibility_score, ui_ux_score, presentation_score, total_score, comments, decision)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        evalId,
        submission_id,
        evaluatorId,
        part,
        part,
        part,
        part,
        remainder,
        numScore,
        commentsText,
        decisionText
      );
    }

    db.prepare("UPDATE submissions SET status = 'shortlisted' WHERE id = ?").run(submission_id);

    await supabaseService.syncEvaluation({
      id: evalId,
      submission_id,
      evaluator_id: evaluatorId,
      innovation_score: part,
      technical_score: part,
      feasibility_score: part,
      ui_ux_score: part,
      presentation_score: remainder,
      total_score: numScore,
      comments: commentsText,
      decision: decisionText,
    });

    res.json({ success: true, message: 'Score saved to leaderboard and synced to Supabase', submission_id, score: numScore });
  } catch (error) {
    console.error('Admin evaluate error:', error);
    res.status(500).json({ success: false, error: 'Failed to save evaluation score' });
  }
});

// POST /api/admin/announcements (Create new announcement banner)
router.post('/announcements', async (req, res) => {
  try {
    const { title, message, category, is_banner } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message are required' });
    }

    const id = 'ann-' + uuidv4().slice(0, 8);
    const annObj = {
      id,
      title,
      message,
      category: category || 'General',
      is_banner: is_banner !== undefined ? (is_banner ? 1 : 0) : 1,
    };

    db.prepare(`
      INSERT INTO announcements (id, title, message, category, is_banner)
      VALUES (?, ?, ?, ?, ?)
    `).run(annObj.id, annObj.title, annObj.message, annObj.category, annObj.is_banner);

    await supabaseService.syncAnnouncement(annObj);

    res.status(201).json({ success: true, message: 'Announcement published and synced to Supabase', announcement: annObj });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create announcement' });
  }
});

// DELETE /api/admin/announcements/:id
router.delete('/announcements/:id', async (req, res) => {
  try {
    db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
    await supabaseService.deleteAnnouncement(req.params.id);
    res.json({ success: true, message: 'Announcement removed from database and Supabase' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete announcement' });
  }
});

module.exports = router;
