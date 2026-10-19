const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const supabaseService = require('../services/supabaseService');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, college, department, phone } = req.body;

    // Direct Admin Login via Admin tab (Name: VyugamAdmin, Pass: VyugamAI2026@password123)
    if (
      role === 'admin' ||
      (name && name.trim().toLowerCase() === 'vyugamadmin') ||
      (email && ['vyugamadmin', 'vyugamadmin@sece.ac.in'].includes(email.trim().toLowerCase()))
    ) {
      const adminName = (name || email || '').trim();
      if (
        adminName.toLowerCase() !== 'vyugamadmin' &&
        adminName.toLowerCase() !== 'vyugamadmin@sece.ac.in'
      ) {
        return res.status(401).json({ success: false, error: 'Invalid Admin name. Use VyugamAdmin.' });
      }
      if (password !== 'VyugamAI2026@password123') {
        return res.status(401).json({ success: false, error: 'Invalid Admin password.' });
      }
      const adminUser = {
        id: 'user-admin-01',
        name: 'VyugamAdmin',
        email: 'vyugamadmin@sece.ac.in',
        role: 'admin',
        college: 'Sri Eshwar College of Engineering',
        department: '',
        phone: ''
      };
      const token = jwt.sign(
        { id: adminUser.id, name: adminUser.name, email: adminUser.email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.status(200).json({
        success: true,
        message: 'Admin logged in successfully',
        token,
        user: adminUser
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@sece.ac.in')) {
      return res.status(400).json({
        success: false,
        error: 'Only mail IDs with domain @sece.ac.in are allowed to sign up.'
      });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    const userId = 'user-' + uuidv4().slice(0, 8);
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userRole = role || 'student';
    const userCollege = college || 'Sri Eshwar College of Engineering';
    const userDept = department || 'AI & Data Science';
    const cleanPhone = (phone || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (cleanPhone && !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.'
      });
    }
    const userPhone = cleanPhone;

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, college, department, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, name, normalizedEmail, hashedPassword, userRole, userCollege, userDept, userPhone);

    const userObj = {
      id: userId,
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
      college: userCollege,
      department: userDept,
      phone: userPhone
    };

    // Async sync to Supabase
    supabaseService.syncUser(userObj);

    const token = jwt.sign({ id: userId, name, email: normalizedEmail, role: userRole }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account created successfully and synced to Supabase',
      token,
      user: { id: userId, name, email: normalizedEmail, role: userRole, college: userCollege, department: userDept, phone: userPhone }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
});

// Helper to derive display name & department from @sece.ac.in email
function deriveStudentProfileFromEmail(email) {
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

  let role = 'student';
  if (lower.startsWith('admin')) role = 'admin';
  else if (lower.includes('evaluator') || lower.includes('jury')) role = 'evaluator';

  return { name: formattedName, department, role };
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Username/Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Direct Admin Login (Name: VyugamAdmin, Pass: VyugamAI2026@password123)
    if (normalizedEmail === 'vyugamadmin' || normalizedEmail === 'vyugamadmin@sece.ac.in') {
      if (password !== 'VyugamAI2026@password123') {
        return res.status(401).json({ success: false, error: 'Invalid Admin password.' });
      }
      const adminUser = {
        id: 'user-admin-01',
        name: 'VyugamAdmin',
        email: 'vyugamadmin@sece.ac.in',
        role: 'admin',
        college: 'Sri Eshwar College of Engineering',
        department: '',
        phone: ''
      };
      const token = jwt.sign(
        { id: adminUser.id, name: adminUser.name, email: adminUser.email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        message: 'Admin login successful',
        token,
        user: adminUser
      });
    }

    if (!normalizedEmail.endsWith('@sece.ac.in')) {
      return res.status(400).json({
        success: false,
        error: 'Only mail IDs with domain @sece.ac.in are allowed to login.'
      });
    }

    let user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(normalizedEmail);

    // If not in local SQLite, check Supabase
    if (!user && supabaseService.getUserByEmail) {
      const sbUser = await supabaseService.getUserByEmail(normalizedEmail);
      if (sbUser) {
        db.prepare(`
          INSERT OR REPLACE INTO users (id, name, email, password, role, college, department, phone)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          sbUser.id,
          sbUser.name,
          sbUser.email.toLowerCase(),
          sbUser.password || bcrypt.hashSync(password, 10),
          sbUser.role || 'student',
          sbUser.college || 'Sri Eshwar College of Engineering',
          sbUser.department || 'Department of AI & DS',
          sbUser.phone || ''
        );
        user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(normalizedEmail);
      }
    }

    // Auto-provision valid @sece.ac.in account if logging in for the first time
    if (!user) {
      const derived = deriveStudentProfileFromEmail(normalizedEmail);
      const userId = 'user-' + uuidv4().slice(0, 8);
      const hashedPassword = bcrypt.hashSync(password, 10);
      const userCollege = 'Sri Eshwar College of Engineering';

      db.prepare(`
        INSERT INTO users (id, name, email, password, role, college, department, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, derived.name, normalizedEmail, hashedPassword, derived.role, userCollege, derived.department, '');

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    } else {
      let passwordMatch = false;
      try {
        passwordMatch = bcrypt.compareSync(password, user.password) || password === user.password;
      } catch {
        passwordMatch = password === user.password;
      }

      if (!passwordMatch) {
        // Update password hash for seamless hackathon access
        const newHash = bcrypt.hashSync(password, 10);
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newHash, user.id);
        user.password = newHash;
      }
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Async sync to Supabase on login
    supabaseService.syncUser(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        department: user.department,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, college, department, phone, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching profile' });
  }
});

// POST /api/auth/demo-switch (Quick login for testing role portals)
router.post('/demo-switch', (req, res) => {
  try {
    const { role } = req.body;
    let targetUser;

    if (role === 'admin') {
      targetUser = db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get();
    } else if (role === 'evaluator') {
      targetUser = db.prepare("SELECT * FROM users WHERE role = 'evaluator' LIMIT 1").get();
    } else {
      targetUser = db.prepare("SELECT * FROM users WHERE role = 'student' LIMIT 1").get();
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Demo user for role not found' });
    }

    const token = jwt.sign({ id: targetUser.id, name: targetUser.name, email: targetUser.email, role: targetUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: `Switched to demo ${targetUser.role} account`,
      token,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        college: targetUser.college,
        department: targetUser.department,
        phone: targetUser.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to switch demo user' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@sece.ac.in')) {
      return res.status(400).json({
        success: false,
        error: 'Only college mail IDs with domain @sece.ac.in are registered on this portal.'
      });
    }

    const user = db.prepare('SELECT id, name, email FROM users WHERE LOWER(email) = ?').get(normalizedEmail);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email. Please verify your @sece.ac.in address or register a new account.'
      });
    }

    // Invalidate any previous unused OTPs for this email
    db.prepare('UPDATE password_resets SET used = 1 WHERE LOWER(email) = ? AND used = 0').run(normalizedEmail);

    // Generate 6-digit OTP
    const resetId = 'reset-' + uuidv4().slice(0, 8);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    db.prepare(`
      INSERT INTO password_resets (id, email, otp, expires_at, used)
      VALUES (?, ?, ?, ?, 0)
    `).run(resetId, normalizedEmail, otp, expiresAt);

    console.log(`[PASSWORD RESET] Generated OTP ${otp} for ${normalizedEmail} (expires in 15 mins)`);

    res.json({
      success: true,
      message: `Verification code generated for ${normalizedEmail}. For instant demo verification, your 6-digit OTP is: ${otp}`,
      otp,
      email: normalizedEmail
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Server error generating password reset code' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, verification code (OTP), and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify user exists
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(normalizedEmail);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }

    // Verify OTP
    const resetRecord = db.prepare(`
      SELECT * FROM password_resets
      WHERE LOWER(email) = ? AND otp = ? AND used = 0
      ORDER BY created_at DESC
      LIMIT 1
    `).get(normalizedEmail, otp.trim());

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code. Please check your OTP or request a new one.'
      });
    }

    // Check expiration
    if (new Date() > new Date(resetRecord.expires_at)) {
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired. Please request a new OTP.'
      });
    }

    // Mark reset code as used
    db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(resetRecord.id);

    // Hash new password and update user
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, user.id);

    // Get updated user
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);

    // Async sync updated user to Supabase
    supabaseService.syncUser(updatedUser);

    console.log(`[PASSWORD RESET] Successfully updated password for ${normalizedEmail}`);

    // Create session token so user can be automatically logged in if desired
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        department: user.department,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Server error resetting password' });
  }
});

module.exports = router;
