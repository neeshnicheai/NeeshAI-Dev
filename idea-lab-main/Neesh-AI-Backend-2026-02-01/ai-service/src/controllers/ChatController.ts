import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { ChatService } from '../services/ChatService';
import { CacheService } from '../services/CacheService';

const SUPPORTED_LLM_PROVIDERS = new Set([
    'OPENROUTER', 'OPENAI', 'CLAUDE', 'GEMINI',
    'GEMINI_25_PRO', 'GEMINI_25_FLASH', 'GEMINI_20_FLASH', 'GEMINI_20_FLASH_LITE',
    'GEMINI_15_PRO', 'GEMINI_15_FLASH',
]);

const GEMINI_VARIANTS = new Set([
    'GEMINI', 'GEMINI_25_PRO', 'GEMINI_25_FLASH',
    'GEMINI_20_FLASH', 'GEMINI_20_FLASH_LITE', 'GEMINI_15_PRO', 'GEMINI_15_FLASH',
]);

export class ChatController {
    private chatService: ChatService;
    private cacheService: CacheService;

    constructor() {
        this.cacheService = new CacheService();
        this.chatService = new ChatService();
        console.log('[ChatController] Initialized with full RAG pipeline');
    }

    private async getUserApiKey(userId: string): Promise<{ provider: string; apiKey: string } | null> {
        try {
            const { data: apiKeys, error } = await supabase
                .from('user_api_keys')
                .select('provider, encrypted_api_key')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false });

            if (error || !apiKeys || apiKeys.length === 0) return null;

            // Priority: OPENROUTER > OPENAI > CLAUDE > any GEMINI variant
            const priority = ['OPENROUTER', 'OPENAI', 'CLAUDE'];
            for (const p of priority) {
                const found = apiKeys.find(k => k.provider === p && k.encrypted_api_key);
                if (found) return { provider: found.provider, apiKey: found.encrypted_api_key };
            }

            // Fallback to first Gemini variant found
            const gemini = apiKeys.find(k => GEMINI_VARIANTS.has(k.provider) && k.encrypted_api_key);
            if (gemini) return { provider: 'GEMINI', apiKey: gemini.encrypted_api_key };

            // Fallback: first available supported LLM key
            const any = apiKeys.find(k => SUPPORTED_LLM_PROVIDERS.has(k.provider) && k.encrypted_api_key);
            if (any) return { provider: any.provider, apiKey: any.encrypted_api_key };

            return null;
        } catch (err) {
            console.error('[ChatController] Error fetching user API key:', err);
            return null;
        }
    }

    private async getLinkedProjectIds(projectId: string): Promise<string[]> {
        try {
            const { data } = await supabase
                .from('project_links')
                .select('linked_project_id')
                .eq('project_id', projectId);
            return (data || []).map((r: any) => r.linked_project_id).filter(Boolean);
        } catch {
            return [];
        }
    }

    async chatWithProject(req: Request, res: Response) {
        try {
            const { id: projectId } = req.params;
            const { query, sessionId } = req.body;

            console.log(`[ChatController] Authenticated chat — project: ${projectId}, user: ${req.user?.id}`);

            if (!query || query.trim().length === 0) {
                return res.status(400).json({ error: 'Query is required' });
            }
            if (query.length > 2000) {
                return res.status(400).json({ error: 'Query too long (max 2000 characters)' });
            }

            // Verify project belongs to user
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('id, title')
                .eq('id', projectId)
                .eq('owner_id', req.user?.id)
                .single();

            if (projectError || !project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Resolve user's LLM provider + key, fall back to env fallback in ChatService
            const userKey = await this.getUserApiKey(req.user!.id);

            const [linkedProjectIds] = await Promise.all([
                this.getLinkedProjectIds(projectId),
            ]);

            const response = await this.chatService.askQuestion(
                projectId,
                query.trim(),
                linkedProjectIds,
                userKey?.provider,
                userKey?.apiKey,
                req.user?.email,
                req.user?.email,
            );

            return res.json(response);

        } catch (error: any) {
            console.error('[ChatController] Chat error:', error.message);

            const isProviderError =
                error.message?.includes('API key') ||
                error.message?.includes('rate limit') ||
                error.message?.includes('quota') ||
                error.message?.includes('not configured');

            return res.status(isProviderError ? 400 : 500).json({
                error: error.message || 'Failed to generate response',
                providerError: isProviderError,
            });
        }
    }

    async publicChatWithProject(req: Request, res: Response) {
        try {
            const { id: projectId } = req.params;
            const { query, sessionId } = req.body;

            console.log(`[ChatController] Public chat — project: ${projectId}`);

            if (!query || query.trim().length === 0) {
                return res.status(400).json({ error: 'Query is required' });
            }
            if (query.length > 2000) {
                return res.status(400).json({ error: 'Query too long (max 2000 characters)' });
            }

            // Verify project is publicly accessible
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('id, title')
                .eq('id', projectId)
                .single();

            if (projectError || !project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Public chat: use env fallback (OPENROUTER_API_KEY / GEMINI_API_KEY) — no user key
            const linkedProjectIds = await this.getLinkedProjectIds(projectId);

            const response = await this.chatService.askQuestion(
                projectId,
                query.trim(),
                linkedProjectIds,
                undefined,
                undefined,
            );

            return res.json(response);

        } catch (error: any) {
            console.error('[ChatController] Public chat error:', error.message);

            return res.status(500).json({
                error: 'Chat service temporarily unavailable. Please try again.',
            });
        }
    }
}
