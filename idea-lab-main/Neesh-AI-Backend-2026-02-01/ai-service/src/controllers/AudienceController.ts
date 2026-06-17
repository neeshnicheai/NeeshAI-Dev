import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class AudienceController {

    async getAudience(req: Request, res: Response) {
        try {
            const { projectId } = req.params;

            const { data: project, error: projError } = await supabase
                .from('projects')
                .select('id')
                .eq('id', projectId)
                .eq('owner_id', req.user?.id)
                .single();

            if (projError || !project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            const { data: members, error } = await supabase
                .from('audience_members')
                .select('*')
                .eq('project_id', projectId)
                .order('last_interaction_at', { ascending: false });

            if (error) throw error;

            const result = (members || []).map(m => ({
                id: m.id,
                name: m.name,
                email: m.email,
                occupation: m.occupation || null,
                personaType: m.detected_persona || null,
                confidenceScore: m.persona_confidence || null,
                engagementScore: null,
                feedbackSummary: null,
                firstInteractionAt: m.first_interaction_at,
                lastInteractionAt: m.last_interaction_at,
                questionCount: m.total_questions || 0,
            }));

            res.json({ members: result, count: result.length });
        } catch (error) {
            console.error('[AudienceController] getAudience error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async submitPublicFeedback(req: Request, res: Response) {
        try {
            const { projectId } = req.params;
            const { name, email, occupation, responses } = req.body;

            const now = new Date().toISOString();

            const { data: existing } = await supabase
                .from('audience_members')
                .select('id, total_questions, total_feedback')
                .eq('project_id', projectId)
                .eq('email', email)
                .single();

            if (existing) {
                await supabase
                    .from('audience_members')
                    .update({
                        name: name || existing.id,
                        occupation: occupation || null,
                        total_feedback: (existing.total_feedback || 0) + 1,
                        last_interaction_at: now,
                        updated_at: now,
                    })
                    .eq('id', existing.id);
            } else {
                await supabase
                    .from('audience_members')
                    .insert({
                        project_id: projectId,
                        name: name || 'Anonymous',
                        email: email || `anon-${Date.now()}@unknown.com`,
                        occupation: occupation || null,
                        total_questions: 0,
                        total_feedback: 1,
                        first_interaction_at: now,
                        last_interaction_at: now,
                        updated_at: now,
                    });
            }

            res.json({ success: true });
        } catch (error) {
            console.error('[AudienceController] submitPublicFeedback error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
