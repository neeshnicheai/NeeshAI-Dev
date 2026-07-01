import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { randomUUID } from 'crypto';
import multer from 'multer';
import { IngestionService } from '../services/IngestionService';

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
});

export const uploadMiddleware = upload.single('file');

export class DocumentController {
    private ingestionService: IngestionService;

    constructor() {
        this.ingestionService = new IngestionService();
    }

    private triggerIngestion(projectId: string): void {
        this.ingestionService.ingestProject(projectId).catch(err =>
            console.error(`[DocumentController] Background ingestion failed for ${projectId}:`, err.message)
        );
    }

    async getProjectDocuments(req: Request, res: Response) {
        try {
            const { projectId } = req.params;
            console.log('[DocumentController] Getting documents for project:', projectId);

            // First verify project belongs to user
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('id')
                .eq('id', projectId)
                .eq('owner_id', req.user?.id)
                .single();

            if (projectError || !project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            const { data: documents, error } = await supabase
                .from('documents')
                .select('*')
                .eq('project_id', projectId)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[DocumentController] Database error:', error);
                return res.status(500).json({ error: 'Failed to fetch documents' });
            }

            res.json(documents || []);
        } catch (error) {
            console.error('[DocumentController] Error getting documents:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async uploadDocument(req: Request, res: Response) {
        try {
            const { projectId } = req.params;
            const file = req.file;

            console.log('[DocumentController] Uploading document to project:', projectId);

            if (!file) {
                return res.status(400).json({ error: 'No file provided' });
            }

            // First verify project belongs to user
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('id')
                .eq('id', projectId)
                .eq('owner_id', req.user?.id)
                .single();

            if (projectError || !project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Generate document ID and storage path
            const documentId = randomUUID();
            const documentGroupId = randomUUID();
            const storagePath = `projects/${projectId}/documents/${documentId}`;

            // Handle file content based on type
            let fileContent: string;

            if (file.mimetype.startsWith('text/') ||
                file.mimetype === 'application/json' ||
                file.mimetype === 'application/xml') {
                // Text files - store as UTF-8
                try {
                    fileContent = file.buffer.toString('utf-8');
                } catch (error) {
                    fileContent = file.buffer.toString('base64');
                }
            } else {
                // Binary files - store as base64
                fileContent = file.buffer.toString('base64');
            }

            const documentData = {
                id: documentId,
                project_id: projectId,
                document_group_id: documentGroupId,
                original_filename: file.originalname,
                mime_type: file.mimetype,
                storage_path: storagePath,
                content: fileContent,
                uploaded_by: req.user?.id,
                is_active: true,
                version: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data: document, error } = await supabase
                .from('documents')
                .insert(documentData)
                .select()
                .single();

            if (error) {
                console.error('[DocumentController] Database error:', error);
                return res.status(500).json({ error: 'Failed to upload document' });
            }

            console.log('[DocumentController] Document uploaded:', document.id);
            res.status(201).json(document);

            // Trigger RAG ingestion in background (non-blocking)
            console.log(`[DocumentController] Triggering background ingestion for project ${projectId}`);
            this.triggerIngestion(projectId);

        } catch (error) {
            console.error('[DocumentController] Error uploading document:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async replaceDocument(req: Request, res: Response) {
        try {
            const { documentId } = req.params;
            const file = req.file;

            console.log('[DocumentController] Replacing document:', documentId);

            if (!file) {
                return res.status(400).json({ error: 'No file provided' });
            }

            // Verify document belongs to user's project
            const { data: document, error: docError } = await supabase
                .from('documents')
                .select('*, projects!inner(owner_id)')
                .eq('id', documentId)
                .eq('projects.owner_id', req.user?.id)
                .single();

            if (docError || !document) {
                return res.status(404).json({ error: 'Document not found' });
            }

            // Handle file content based on type
            let fileContent: string;

            if (file.mimetype.startsWith('text/') ||
                file.mimetype === 'application/json' ||
                file.mimetype === 'application/xml') {
                // Text files - store as UTF-8
                try {
                    fileContent = file.buffer.toString('utf-8');
                } catch (error) {
                    fileContent = file.buffer.toString('base64');
                }
            } else {
                // Binary files - store as base64
                fileContent = file.buffer.toString('base64');
            }

            // Update document with new content
            const updateData = {
                original_filename: file.originalname,
                mime_type: file.mimetype,
                content: fileContent,
                version: document.version + 1,
                updated_at: new Date().toISOString()
            };

            const { data: updatedDocument, error: updateError } = await supabase
                .from('documents')
                .update(updateData)
                .eq('id', documentId)
                .select()
                .single();

            if (updateError) {
                console.error('[DocumentController] Database error:', updateError);
                return res.status(500).json({ error: 'Failed to replace document' });
            }

            console.log('[DocumentController] Document replaced:', documentId);
            res.json(updatedDocument);

            // Trigger RAG re-ingestion in background (non-blocking)
            const replacedProjectId = document.project_id;
            console.log(`[DocumentController] Triggering background re-ingestion for project ${replacedProjectId}`);
            this.triggerIngestion(replacedProjectId);

        } catch (error) {
            console.error('[DocumentController] Error replacing document:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async refreshDocuments(req: Request, res: Response) {
        try {
            const { projectId } = req.params;
            console.log('[DocumentController] Refreshing documents for project:', projectId);

            // First verify project belongs to user
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('id')
                .eq('id', projectId)
                .eq('owner_id', req.user?.id)
                .single();

            if (projectError || !project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            console.log('[DocumentController] Documents refresh triggered for project:', projectId);
            res.json({ message: 'Documents refresh initiated', projectId });

            // Trigger full re-ingestion in background (non-blocking)
            this.triggerIngestion(projectId);
        } catch (error) {
            console.error('[DocumentController] Error refreshing documents:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}