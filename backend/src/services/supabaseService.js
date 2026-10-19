const { supabase } = require('../config/supabase');

class SupabaseService {

  // Fetch user by email from Supabase
  async getUserByEmail(email) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email)
        .maybeSingle();
      if (error) return null;
      return data || null;
    } catch {
      return null;
    }
  }

  // Sync user creation to Supabase
  async syncUser(user) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('users').upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        college: user.college,
        department: user.department,
        phone: user.phone
      });
      if (error) console.warn('Supabase syncUser notice:', error.message);
    } catch (e) {
      console.warn('Supabase syncUser exception:', e.message);
    }
  }

  // Sync team creation & problem statement mapping to Supabase
  async syncTeam(team) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('teams').upsert({
        id: team.id,
        name: team.name,
        leader_id: team.leader_id,
        college: team.college,
        track: team.track,
        problem_statement_id: team.problem_statement_id || null,
        status: team.status || 'forming'
      });
      if (error) console.warn('Supabase syncTeam notice:', error.message);
    } catch (e) {
      console.warn('Supabase syncTeam exception:', e.message);
    }
  }

  // Map problem statement selection to team in Supabase
  async mapTeamProblem(teamId, problemId) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('teams').update({
        problem_statement_id: problemId
      }).eq('id', teamId);
      if (error) console.warn('Supabase mapTeamProblem notice:', error.message);
    } catch (e) {
      console.warn('Supabase mapTeamProblem exception:', e.message);
    }
  }

  // Sync team member roster to Supabase
  async syncTeamMember(member) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('team_members').upsert({
        id: member.id,
        team_id: member.team_id,
        name: member.name,
        email: member.email,
        role_in_team: member.role_in_team,
        gender: member.gender,
        college_id_no: member.college_id_no || '',
        year_of_study: member.year_of_study || '3rd Year'
      });
      if (error) console.warn('Supabase syncTeamMember notice:', error.message);
    } catch (e) {
      console.warn('Supabase syncTeamMember exception:', e.message);
    }
  }

  // Sync proposal submission to Supabase
  async syncSubmission(sub) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('submissions').upsert({
        id: sub.id,
        team_id: sub.team_id,
        problem_statement_id: sub.problem_statement_id,
        idea_title: sub.idea_title,
        executive_summary: sub.executive_summary,
        proposed_solution: sub.proposed_solution,
        tech_stack: sub.tech_stack || '',
        ppt_url: sub.ppt_url || '',
        github_url: sub.github_url || '',
        demo_video_url: sub.demo_video_url || '',
        status: sub.status || 'submitted'
      });
      if (error) console.warn('Supabase syncSubmission notice:', error.message);
    } catch (e) {
      console.warn('Supabase syncSubmission exception:', e.message);
    }
  }

  // Sync evaluation score to Supabase
  async syncEvaluation(evalItem) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('evaluations').upsert({
        id: evalItem.id,
        submission_id: evalItem.submission_id,
        evaluator_id: evalItem.evaluator_id,
        innovation_score: evalItem.innovation_score,
        technical_score: evalItem.technical_score,
        feasibility_score: evalItem.feasibility_score,
        ui_ux_score: evalItem.ui_ux_score,
        presentation_score: evalItem.presentation_score,
        total_score: evalItem.total_score,
        comments: evalItem.comments || '',
        decision: evalItem.decision
      });
      if (error) console.warn('Supabase syncEvaluation notice:', error.message);
    } catch (e) {
      console.warn('Supabase syncEvaluation exception:', e.message);
    }
  }

  // Sync announcement to Supabase
  async syncAnnouncement(ann) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('announcements').upsert({
        id: ann.id,
        title: ann.title,
        message: ann.message,
        category: ann.category || 'General',
        is_banner: ann.is_banner || 0
      });
      if (error) console.warn('Supabase syncAnnouncement notice:', error.message);
    } catch (e) {
      console.warn('Supabase syncAnnouncement exception:', e.message);
    }
  }

  // Sync contact message to Supabase
  async syncContactMessage(msg) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('contact_messages').upsert({
        id: msg.id,
        name: msg.name,
        email: msg.email,
        subject: msg.subject,
        message: msg.message
      });
      if (error) console.warn('Supabase syncContactMessage notice:', error.message);
    } catch (e) {
      console.warn('Supabase syncContactMessage exception:', e.message);
    }
  }

}

module.exports = new SupabaseService();
