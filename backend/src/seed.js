const { db, initDb } = require('./database');
const { sampleUsers, sampleProblemStatements, sampleAnnouncements } = require('./data/seedData');
const { v4: uuidv4 } = require('uuid');

function seedDatabase() {
  initDb();

  // Ensure all sample users exist
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, password, role, college, department, phone)
    VALUES (@id, @name, @email, @password, @role, @college, @department, @phone)
  `);
  for (const u of sampleUsers) {
    insertUser.run(u);
  }

  // Check if problem statements exist
  const psCount = db.prepare('SELECT COUNT(*) as count FROM problem_statements').get().count;
  if (psCount === 0) {
    console.log('Seeding initial problem statements...');
    const insertPS = db.prepare(`
      INSERT INTO problem_statements (id, title, category, domain_bucket, organization, description, desired_outcome, complexity, dataset_url)
      VALUES (@id, @title, @category, @domain_bucket, @organization, @description, @desired_outcome, @complexity, @dataset_url)
    `);

    for (const ps of sampleProblemStatements) {
      insertPS.run(ps);
    }
  }

  // Check if announcements exist
  const annCount = db.prepare('SELECT COUNT(*) as count FROM announcements').get().count;
  if (annCount === 0) {
    console.log('Seeding initial announcements...');
    const insertAnn = db.prepare(`
      INSERT INTO announcements (id, title, message, category, is_banner)
      VALUES (@id, @title, @message, @category, @is_banner)
    `);

    for (const ann of sampleAnnouncements) {
      insertAnn.run(ann);
    }
  }

  // Seed sample team and submission if empty
  const teamCount = db.prepare('SELECT COUNT(*) as count FROM teams').get().count;
  if (teamCount === 0) {
    console.log('Seeding sample team and submission...');
    const teamId = 'team-neural-knights-01';
    db.prepare(`
      INSERT INTO teams (id, name, leader_id, college, track, problem_statement_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(teamId, 'Neural Knights', 'user-student-01', 'Sri Eshwar College of Engineering', 'Software', 'VYUGAM-001', 'submitted');

    // Add team members
    const insertMember = db.prepare(`
      INSERT INTO team_members (id, team_id, name, email, role_in_team, gender, college_id_no, year_of_study)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertMember.run(uuidv4(), teamId, 'Arjun Vikram', 'arjun@student.vyugam.edu', 'Leader & AI Dev', 'Male', 'VIT2023CS001', '3rd Year');
    insertMember.run(uuidv4(), teamId, 'Samyuktha R', 'samyuktha@student.vyugam.edu', 'Full Stack Engineer', 'Female', 'VIT2023CS042', '3rd Year');
    insertMember.run(uuidv4(), teamId, 'Kavya S', 'kavya@student.vyugam.edu', 'Data Scientist', 'Female', 'VIT2023DS012', '2nd Year');

    // Add submission
    const subId = 'sub-neural-01';
    db.prepare(`
      INSERT INTO submissions (id, team_id, problem_statement_id, idea_title, executive_summary, proposed_solution, tech_stack, ppt_url, github_url, demo_video_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      subId,
      teamId,
      'VYUGAM-001',
      'CampusGrid AI: Smart Microgrid Optimization Protocol',
      'An end to end IoT telemetry pipeline powered by LSTM neural networks to dynamically predict classroom occupancy and balance solar inverter output.',
      'Our solution features edge sensors connected via MQTT, real time stream processing with Apache Kafka, and a Next.js live telemetry dashboard for campus facilities management.',
      'Python, PyTorch, React, Node.js, MQTT, Docker, SQLite',
      'https://vyugam.edu/docs/neural_knights_ppt.pdf',
      'https://github.com/vyugam-ai/neural-knights-energy-ai',
      'https://youtube.com/watch?v=demo_vyugam_001',
      'under_review'
    );

    // Update PS submissions_count
    db.prepare('UPDATE problem_statements SET submissions_count = submissions_count + 1 WHERE id = ?').run('VYUGAM-001');

    // Add sample evaluation
    db.prepare(`
      INSERT INTO evaluations (id, submission_id, evaluator_id, innovation_score, technical_score, feasibility_score, ui_ux_score, presentation_score, total_score, comments, decision)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      uuidv4(),
      subId,
      'user-eval-01',
      18, 19, 17, 18, 19,
      91,
      'Exceptional architectural design and clear IoT integration strategy. Highly viable for immediate college campus implementation.',
      'Shortlist'
    );
  }

  console.log('Database seeding process complete.');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
