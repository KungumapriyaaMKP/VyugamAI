const { supabase } = require('../config/supabase');

class SupabaseService {
  // Fetch user by email from Supabase
  async getUserByEmail(email) {
    if (!supabase || !email) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email.trim())
        .maybeSingle();
      if (error) return null;
      return data || null;
    } catch {
      return null;
    }
  }

  // Ensure a user exists in Supabase and return their canonical Supabase user ID
  async syncUser(user) {
    if (!supabase || !user || !user.email) return user?.id || null;
    try {
      const normalizedEmail = user.email.trim().toLowerCase();
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      const canonicalId = existing?.id || user.id || 'user-' + Math.random().toString(36).substring(2, 10);
      const validRole = ['student', 'evaluator', 'admin'].includes(user.role) ? user.role : 'student';

      const payload = {
        id: canonicalId,
        name: user.name || 'SECE Student',
        email: normalizedEmail,
        password: user.password || 'hashed_password',
        role: validRole,
        college: user.college || 'Sri Eshwar College of Engineering',
        department: user.department || 'Department of AI & DS',
        phone: user.phone || '',
      };

      const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase syncUser notice:', error.message);
      }
      return canonicalId;
    } catch (e) {
      console.warn('Supabase syncUser exception:', e.message);
      return user?.id || null;
    }
  }

  // Ensure problem statement exists in Supabase
  async syncProblemStatement(ps) {
    if (!supabase || !ps || !ps.id) return;
    try {
      const payload = {
        id: ps.id,
        title: ps.title || ps.id,
        category: ps.category || 'AI & Machine Learning',
        domain_bucket: ps.domain_bucket || 'Software',
        organization: ps.organization || 'Sri Eshwar College of Engineering',
        description: ps.description || '',
        desired_outcome: ps.desired_outcome || '',
        complexity: ps.complexity || 'Medium',
        dataset_url: ps.dataset_url || '',
        submissions_count: Number(ps.submissions_count) || 0,
        is_active: ps.is_active !== undefined ? Number(ps.is_active) : 1,
      };
      const { error } = await supabase.from('problem_statements').upsert(payload, { onConflict: 'id' });
      if (error) console.warn('Supabase syncProblemStatement notice:', error.message);
    } catch (e) {
      console.warn('Supabase syncProblemStatement exception:', e.message);
    }
  }

  async deleteProblemStatement(psId) {
    if (!supabase || !psId) return;
    try {
      const { error } = await supabase.from('problem_statements').delete().eq('id', psId);
      if (error) console.warn('Supabase deleteProblemStatement notice:', error.message);
    } catch (e) {
      console.warn('Supabase deleteProblemStatement exception:', e.message);
    }
  }

  // Sync team creation & problem statement mapping to Supabase
  async syncTeam(team, leaderUser = null) {
    if (!supabase || !team) return team?.id || null;
    try {
      let leaderId = team.leader_id;

      // Ensure leader exists in Supabase users table first to satisfy FK constraint
      if (leaderUser && leaderUser.email) {
        leaderId = await this.syncUser({ ...leaderUser, id: leaderId });
      } else if (leaderId) {
        const { data: uById } = await supabase.from('users').select('id').eq('id', leaderId).maybeSingle();
        if (!uById) {
          const { data: fallbackUser } = await supabase.from('users').select('id').eq('role', 'student').limit(1).maybeSingle();
          if (fallbackUser?.id) leaderId = fallbackUser.id;
        }
      }

      // Check if team with same name already exists in Supabase with a different ID
      const { data: existingByName } = await supabase
        .from('teams')
        .select('id')
        .ilike('name', team.name.trim())
        .maybeSingle();

      const canonicalTeamId = existingByName?.id || team.id;
      const validStatuses = ['forming', 'submitted', 'shortlisted', 'finalist', 'winner'];
      const safeStatus = validStatuses.includes(team.status) ? team.status : 'forming';

      // Verify problem_statement_id exists in Supabase if provided
      let safePsId = team.problem_statement_id || null;
      if (safePsId) {
        const { data: psRow } = await supabase.from('problem_statements').select('id').eq('id', safePsId).maybeSingle();
        if (!psRow) safePsId = null;
      }

      const { error } = await supabase.from('teams').upsert(
        {
          id: canonicalTeamId,
          name: team.name.trim(),
          leader_id: leaderId,
          college: team.college || 'Sri Eshwar College of Engineering',
          track: team.track || 'Software',
          problem_statement_id: safePsId,
          status: safeStatus,
        },
        { onConflict: 'id' }
      );
      if (error) console.warn('Supabase syncTeam notice:', error.message);
      return canonicalTeamId;
    } catch (e) {
      console.warn('Supabase syncTeam exception:', e.message);
      return team?.id || null;
    }
  }

  // Map problem statement selection to team in Supabase
  async mapTeamProblem(teamId, problemId, leaderEmail = null) {
    if (!supabase || !problemId) return;
    try {
      if (teamId) {
        const { error } = await supabase
          .from('teams')
          .update({ problem_statement_id: problemId })
          .eq('id', teamId);
        if (error) console.warn('Supabase mapTeamProblem notice:', error.message);
      }
      if (leaderEmail) {
        const { data: u } = await supabase.from('users').select('id').ilike('email', leaderEmail).maybeSingle();
        if (u?.id) {
          await supabase.from('teams').update({ problem_statement_id: problemId }).eq('leader_id', u.id);
        }
      }
    } catch (e) {
      console.warn('Supabase mapTeamProblem exception:', e.message);
    }
  }

  // Update team status in Supabase
  async updateTeamStatus(teamId, status) {
    if (!supabase || !teamId || !status) return;
    try {
      const validStatuses = ['forming', 'submitted', 'shortlisted', 'finalist', 'winner'];
      const safeStatus = validStatuses.includes(status) ? status : 'shortlisted';
      const { error } = await supabase.from('teams').update({ status: safeStatus }).eq('id', teamId);
      if (error) console.warn('Supabase updateTeamStatus notice:', error.message);
    } catch (e) {
      console.warn('Supabase updateTeamStatus exception:', e.message);
    }
  }

  // Delete team and child records in Supabase
  async deleteTeam(teamId) {
    if (!supabase || !teamId) return;
    try {
      const { data: subs } = await supabase.from('submissions').select('id').eq('team_id', teamId);
      if (subs && subs.length > 0) {
        const subIds = subs.map((s) => s.id);
        await supabase.from('evaluations').delete().in('submission_id', subIds);
      }
      await supabase.from('submissions').delete().eq('team_id', teamId);
      await supabase.from('team_members').delete().eq('team_id', teamId);
      const { error } = await supabase.from('teams').delete().eq('id', teamId);
      if (error) console.warn('Supabase deleteTeam notice:', error.message);
    } catch (e) {
      console.warn('Supabase deleteTeam exception:', e.message);
    }
  }

  // Sync team member roster to Supabase
  async syncTeamMember(member) {
    if (!supabase || !member) return;
    try {
      const { error } = await supabase.from('team_members').upsert(
        {
          id: member.id,
          team_id: member.team_id,
          name: member.name,
          email: member.email,
          role_in_team: member.role_in_team || 'Developer',
          gender: member.gender || 'Female',
          college_id_no: member.college_id_no || '24AD001',
          year_of_study: member.year_of_study || '3rd Year',
        },
        { onConflict: 'id' }
      );
      if (error) console.warn('Supabase syncTeamMember notice:', error.message);
    } catch (e) {
      console.warn('Supabase syncTeamMember exception:', e.message);
    }
  }

  // Sync proposal submission to Supabase
  async syncSubmission(sub) {
    if (!supabase || !sub || !sub.team_id) return;
    try {
      // Check if a submission already exists for this team_id in Supabase (team_id is UNIQUE)
      const { data: existingSub } = await supabase
        .from('submissions')
        .select('id')
        .eq('team_id', sub.team_id)
        .maybeSingle();

      const canonicalSubId = existingSub?.id || sub.id;
      const validStatuses = ['submitted', 'under_review', 'shortlisted', 'rejected', 'winner'];
      const safeStatus = validStatuses.includes(sub.status) ? sub.status : 'submitted';

      const { error } = await supabase.from('submissions').upsert(
        {
          id: canonicalSubId,
          team_id: sub.team_id,
          problem_statement_id: sub.problem_statement_id || 'VYUGAM-001',
          idea_title: sub.idea_title,
          executive_summary: sub.executive_summary,
          proposed_solution: sub.proposed_solution,
          tech_stack: sub.tech_stack || '',
          ppt_url: sub.ppt_url || '',
          github_url: sub.github_url || '',
          demo_video_url: sub.demo_video_url || '',
          status: safeStatus,
        },
        { onConflict: 'id' }
      );
      if (error) console.warn('Supabase syncSubmission notice:', error.message);

      // Also mark team status as submitted in Supabase
      await supabase.from('teams').update({ status: 'submitted' }).eq('id', sub.team_id);
    } catch (e) {
      console.warn('Supabase syncSubmission exception:', e.message);
    }
  }

  // Sync evaluation score to Supabase
  async syncEvaluation(evalItem) {
    if (!supabase || !evalItem || !evalItem.submission_id) return;
    try {
      let evaluatorId = evalItem.evaluator_id || 'user-admin-01';
      const { data: uRow } = await supabase.from('users').select('id').eq('id', evaluatorId).maybeSingle();
      if (!uRow) {
        const { data: fallbackEval } = await supabase
          .from('users')
          .select('id')
          .in('role', ['admin', 'evaluator'])
          .limit(1)
          .maybeSingle();
        if (fallbackEval?.id) evaluatorId = fallbackEval.id;
      }

      const validDecisions = ['Shortlist', 'Reject', 'Under Review'];
      const safeDecision = validDecisions.includes(evalItem.decision) ? evalItem.decision : 'Shortlist';

      const { error } = await supabase.from('evaluations').upsert(
        {
          id: evalItem.id,
          submission_id: evalItem.submission_id,
          evaluator_id: evaluatorId,
          innovation_score: Number(evalItem.innovation_score) || 0,
          technical_score: Number(evalItem.technical_score) || 0,
          feasibility_score: Number(evalItem.feasibility_score) || 0,
          ui_ux_score: Number(evalItem.ui_ux_score) || 0,
          presentation_score: Number(evalItem.presentation_score) || 0,
          total_score: Number(evalItem.total_score) || 0,
          comments: evalItem.comments || '',
          decision: safeDecision,
        },
        { onConflict: 'id' }
      );
      if (error) console.warn('Supabase syncEvaluation notice:', error.message);
    } catch (e) {
      console.warn('Supabase syncEvaluation exception:', e.message);
    }
  }

  // Sync announcement to Supabase
  async syncAnnouncement(ann) {
    if (!supabase || !ann) return;
    try {
      const { error } = await supabase.from('announcements').upsert(
        {
          id: ann.id,
          title: ann.title,
          message: ann.message,
          category: ann.category || 'General',
          is_banner: ann.is_banner ? 1 : 0,
        },
        { onConflict: 'id' }
      );
      if (error) console.warn('Supabase syncAnnouncement notice:', error.message);
    } catch (e) {
      console.warn('Supabase syncAnnouncement exception:', e.message);
    }
  }

  async deleteAnnouncement(annId) {
    if (!supabase || !annId) return;
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', annId);
      if (error) console.warn('Supabase deleteAnnouncement notice:', error.message);
    } catch (e) {
      console.warn('Supabase deleteAnnouncement exception:', e.message);
    }
  }

  // Sync contact message to Supabase
  async syncContactMessage(msg) {
    if (!supabase || !msg) return;
    try {
      const { error } = await supabase.from('contact_messages').upsert(
        {
          id: msg.id,
          name: msg.name,
          email: msg.email,
          subject: msg.subject,
          message: msg.message,
        },
        { onConflict: 'id' }
      );
      if (error) console.warn('Supabase syncContactMessage notice:', error.message);
    } catch (e) {
      console.warn('Supabase syncContactMessage exception:', e.message);
    }
  }
}

module.exports = new SupabaseService();
