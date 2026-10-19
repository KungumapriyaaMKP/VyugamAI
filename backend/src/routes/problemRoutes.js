const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const { db } = require('../database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const supabaseService = require('../services/supabaseService');

// 60-second in-memory cache for high concurrency handling (3000+ users)
const psCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// GET /api/problems (Public with fast caching & dynamic filtering)
router.get('/', (req, res) => {
  try {
    const { category, domain, complexity, search } = req.query;
    const cacheKey = `ps_all_${category || 'all'}_${domain || 'all'}_${complexity || 'all'}_${search || 'all'}`;

    const cachedData = psCache.get(cacheKey);
    if (cachedData) {
      return res.json({ success: true, cached: true, count: cachedData.length, problems: cachedData });
    }

    let query = 'SELECT * FROM problem_statements WHERE is_active = 1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (domain && domain !== 'All') {
      query += ' AND domain_bucket = ?';
      params.push(domain);
    }

    if (complexity && complexity !== 'All') {
      query += ' AND complexity = ?';
      params.push(complexity);
    }

    if (search && search.trim() !== '') {
      query += ' AND (id LIKE ? OR title LIKE ? OR description LIKE ? OR organization LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY id ASC';

    const stmt = db.prepare(query);
    const problems = stmt.all(...params);

    psCache.set(cacheKey, problems);

    res.json({
      success: true,
      cached: false,
      count: problems.length,
      problems
    });
  } catch (error) {
    console.error('Error fetching problem statements:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve problem statements' });
  }
});

// GET /api/problems/categories (List unique categories & domain counts)
router.get('/meta/categories', (req, res) => {
  try {
    const cachedMeta = psCache.get('ps_meta');
    if (cachedMeta) {
      return res.json({ success: true, meta: cachedMeta });
    }

    const categories = db.prepare('SELECT DISTINCT category FROM problem_statements ORDER BY category ASC').all().map(c => c.category);
    const domains = db.prepare('SELECT DISTINCT domain_bucket FROM problem_statements ORDER BY domain_bucket ASC').all().map(d => d.domain_bucket);
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN domain_bucket = 'Software' THEN 1 ELSE 0 END) as software_count,
        SUM(CASE WHEN domain_bucket = 'Hardware' THEN 1 ELSE 0 END) as hardware_count,
        SUM(CASE WHEN domain_bucket = 'Both' THEN 1 ELSE 0 END) as both_count
      FROM problem_statements
    `).get();

    const metaData = { categories, domains, stats };
    psCache.set('ps_meta', metaData, 300);

    res.json({ success: true, meta: metaData });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve metadata' });
  }
});

// GET /api/problems/:id (Single problem details)
router.get('/:id', (req, res) => {
  try {
    const problem = db.prepare('SELECT * FROM problem_statements WHERE id = ?').get(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem statement not found' });
    }
    res.json({ success: true, problem });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch problem details' });
  }
});

// POST /api/problems (Create new problem statement from Admin Panel)
router.post('/', async (req, res) => {
  try {
    const { id, title, category, domain_bucket, organization, description, desired_outcome, complexity, dataset_url } = req.body;

    if (!id || !title || !category || !organization || !description) {
      return res.status(400).json({ success: false, error: 'Missing required problem statement fields' });
    }

    const psObj = {
      id,
      title,
      category,
      domain_bucket: domain_bucket || 'Software',
      organization,
      description,
      desired_outcome: desired_outcome || '',
      complexity: complexity || 'Medium',
      dataset_url: dataset_url || '',
      submissions_count: 0,
      is_active: 1
    };

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO problem_statements (id, title, category, domain_bucket, organization, description, desired_outcome, complexity, dataset_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    insertStmt.run(psObj.id, psObj.title, psObj.category, psObj.domain_bucket, psObj.organization, psObj.description, psObj.desired_outcome, psObj.complexity, psObj.dataset_url);

    psCache.flushAll(); // Invalidate cache

    await supabaseService.syncProblemStatement(psObj);

    res.status(201).json({ success: true, message: 'Problem statement created and synced to Supabase', id, problem: psObj });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error creating problem statement: ' + error.message });
  }
});

// DELETE /api/problems/:id (Remove problem statement from Admin Panel)
router.delete('/:id', async (req, res) => {
  try {
    db.prepare('DELETE FROM problem_statements WHERE id = ?').run(req.params.id);
    psCache.flushAll();
    await supabaseService.deleteProblemStatement(req.params.id);
    res.json({ success: true, message: 'Problem statement deleted from database and Supabase', id: req.params.id });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete problem statement' });
  }
});

module.exports = router;
