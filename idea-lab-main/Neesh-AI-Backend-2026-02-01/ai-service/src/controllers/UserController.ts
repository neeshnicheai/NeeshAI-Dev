import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

const FREE_PROJECT_LIMIT = 5;
const PRO_PROJECT_LIMIT = 999;

export class UserController {

    async getSubscription(req: Request, res: Response) {
        try {
            const userId = req.user?.id;

            const { data: profile } = await supabase
                .from('profiles')
                .select('status')
                .eq('id', userId)
                .single();

            const plan = profile?.status?.toUpperCase() === 'PRO' ? 'PRO' : 'FREE';

            const { count: projectCount } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .eq('owner_id', userId)
                .eq('deleted', false);

            const maxProjects = plan === 'PRO' ? PRO_PROJECT_LIMIT : FREE_PROJECT_LIMIT;
            const count = projectCount || 0;

            res.json({
                plan,
                projectCount: count,
                maxProjects,
                canCreateProject: count < maxProjects,
                customLogoUrl: '',
                customBrandingText: '',
                subscriptionExpiresAt: null,
            });
        } catch (error) {
            console.error('[UserController] getSubscription error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async upgradeToPro(req: Request, res: Response) {
        try {
            const userId = req.user?.id;

            const { error } = await supabase
                .from('profiles')
                .update({ status: 'PRO', updated_at: new Date().toISOString() })
                .eq('id', userId);

            if (error) throw error;

            res.json({ success: true, plan: 'PRO' });
        } catch (error) {
            console.error('[UserController] upgradeToPro error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateBranding(req: Request, res: Response) {
        res.json({ success: true });
    }
}
