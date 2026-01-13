import { Injectable } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import { SelfhelpService } from './selfhelp.service';
import {
    LlmConversation,
    LlmMessage,
    LlmGetConversationsResponse,
    LlmGetConversationResponse,
    LlmSendMessageResponseExtended,
    LlmNewConversationResponse,
    LlmDeleteConversationResponse,
    LlmSelectedFile,
    LlmFormSubmissionResponse,
    LlmGetProgressResponse,
    LlmFileConfig
} from '../selfhelpInterfaces';

/**
 * Default file configuration
 */
export const DEFAULT_FILE_CONFIG: LlmFileConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFilesPerMessage: 5,
    allowedImageExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    allowedDocumentExtensions: ['pdf', 'txt', 'md', 'csv', 'json', 'xml'],
    allowedCodeExtensions: ['py', 'js', 'php', 'html', 'css', 'sql', 'sh', 'yaml', 'yml'],
    allowedExtensions: [
        'jpg', 'jpeg', 'png', 'gif', 'webp',
        'pdf', 'txt', 'md', 'csv', 'json', 'xml',
        'py', 'js', 'php', 'html', 'css', 'sql', 'sh', 'yaml', 'yml'
    ],
    visionModels: ['internvl3-8b-instruct', 'qwen3-vl-8b-instruct']
};

/**
 * LLM Chat Service
 * Handles all API communication for the LLM Chat component
 */
@Injectable({
    providedIn: 'root'
})
export class LlmChatService {

    constructor(private selfhelpService: SelfhelpService) { }

    /**
     * Get all conversations for the current user
     * @param sectionId The section ID for this chat instance
     * @returns Promise resolving to array of conversations
     */
    async getConversations(sectionId: number): Promise<LlmConversation[]> {
        // Build query parameters including mobile parameters like execServerRequest does
        const queryParams = new URLSearchParams({
            action: 'get_conversations',
            section_id: sectionId.toString(),
            mobile: 'true',
            id_languages: (this.selfhelpService.selfhelp.value.user_language ? this.selfhelpService.selfhelp.value.user_language : this.selfhelpService.getUserLanguage().id).toString(),
            device_id: await this.selfhelpService.getDeviceID(),
            mobile_web: 'true'
        });

        // Build URL with query parameters
        const baseUrl = this.buildUrl(sectionId);
        const fullUrl = `${baseUrl}?${queryParams.toString()}`;

        // Use CapacitorHttp.get instead of execServerRequest
        const response = await CapacitorHttp.get({
            url: fullUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            webFetchExtra: {
                credentials: "include",
            }
        });

        let parsedResponse: LlmGetConversationsResponse;
        if (typeof response.data === 'string') {
            parsedResponse = JSON.parse(response.data);
        } else {
            parsedResponse = response.data;
        }

        if (parsedResponse.error) {
            throw new Error(parsedResponse.error);
        }

        return parsedResponse.conversations || [];
    }

    /**
     * Get a specific conversation with its messages
     * @param conversationId The conversation ID
     * @param sectionId The section ID
     * @returns Promise resolving to conversation and messages
     */
    async getConversation(conversationId: string, sectionId: number): Promise<{
        conversation: LlmConversation;
        messages: LlmMessage[];
    }> {
        const params = {
            action: 'get_conversation',
            conversation_id: conversationId,
            section_id: sectionId.toString()
        };
        const response = await this.selfhelpService.execServerRequest<LlmGetConversationResponse>(
            this.buildUrl(sectionId),
            params
        );
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.conversation || !response.messages) {
            throw new Error('Invalid response format');
        }
        return {
            conversation: response.conversation,
            messages: response.messages
        };
    }

    /**
     * Create a new conversation
     * @param title Conversation title
     * @param model LLM model to use
     * @param sectionId The section ID
     * @returns Promise resolving to the new conversation ID
     */
    async createConversation(title: string, model: string, sectionId: number): Promise<string> {
        const params = {
            action: 'new_conversation',
            title: title,
            model: model,
            section_id: sectionId.toString()
        };
        const response = await this.selfhelpService.execServerRequest<LlmNewConversationResponse>(
            this.buildUrl(sectionId),
            params
        );
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.conversation_id) {
            throw new Error('No conversation ID returned');
        }
        return response.conversation_id;
    }

    /**
     * Delete a conversation
     * @param conversationId ID of conversation to delete
     * @param sectionId The section ID
     */
    async deleteConversation(conversationId: string, sectionId: number): Promise<void> {
        const params = {
            action: 'delete_conversation',
            conversation_id: conversationId,
            section_id: sectionId.toString()
        };
        const response = await this.selfhelpService.execServerRequest<LlmDeleteConversationResponse>(
            this.buildUrl(sectionId),
            params
        );
        if (response.error) {
            throw new Error(response.error);
        }
    }

    /**
     * Send a message to the LLM
     * @param message Message content
     * @param conversationId Conversation ID (optional, creates new if not provided)
     * @param model LLM model to use
     * @param sectionId The section ID
     * @param files Optional array of files to attach
     * @returns Promise resolving to send result
     */
    async sendMessage(
        message: string,
        conversationId: string | null,
        model: string,
        sectionId: number,
        files: LlmSelectedFile[] = []
    ): Promise<LlmSendMessageResponseExtended> {
        const params: Record<string, string> = {
            action: 'send_message',
            message: message,
            model: model,
            section_id: sectionId.toString()
        };
        if (conversationId) {
            params['conversation_id'] = conversationId;
        }

        // Handle file uploads
        if (files.length > 0) {
            // For file uploads, we need to use FormData
            // Convert files to base64 and include in params
            const fileDataArray: string[] = [];
            for (const selectedFile of files) {
                const base64 = await this.fileToBase64(selectedFile.file);
                fileDataArray.push(JSON.stringify({
                    name: selectedFile.file.name,
                    type: selectedFile.file.type,
                    size: selectedFile.file.size,
                    data: base64
                }));
            }
            params['uploaded_files'] = JSON.stringify(fileDataArray);
        }

        return this.selfhelpService.execServerRequest<LlmSendMessageResponseExtended>(
            this.buildUrl(sectionId),
            params
        );
    }

    /**
     * Submit form selections (form mode)
     * @param formValues Object mapping field IDs to selected values
     * @param readableText Human-readable text representation of selections
     * @param conversationId Conversation ID (optional)
     * @param model LLM model to use
     * @param sectionId The section ID
     * @returns Promise resolving to form submission result
     */
    async submitForm(
        formValues: Record<string, string | string[]>,
        readableText: string,
        conversationId: string | null,
        model: string,
        sectionId: number
    ): Promise<LlmFormSubmissionResponse> {
        const params: Record<string, string> = {
            action: 'submit_form',
            form_values: JSON.stringify(formValues),
            readable_text: readableText,
            model: model,
            section_id: sectionId.toString()
        };
        if (conversationId) {
            params['conversation_id'] = conversationId;
        }

        return this.selfhelpService.execServerRequest<LlmFormSubmissionResponse>(
            this.buildUrl(sectionId),
            params
        );
    }

    /**
     * Continue conversation (form mode - when no form is pending)
     * @param conversationId The conversation ID
     * @param model LLM model to use
     * @param sectionId The section ID
     * @returns Promise resolving to response
     */
    async continueConversation(
        conversationId: string,
        model: string,
        sectionId: number
    ): Promise<LlmSendMessageResponseExtended> {
        const params: Record<string, string> = {
            action: 'continue_conversation',
            conversation_id: conversationId,
            model: model,
            section_id: sectionId.toString()
        };

        return this.selfhelpService.execServerRequest<LlmSendMessageResponseExtended>(
            this.buildUrl(sectionId),
            params
        );
    }

    /**
     * Get progress data for a conversation
     * @param conversationId The conversation ID
     * @param sectionId The section ID
     * @returns Promise resolving to progress data
     */
    async getProgress(conversationId: string, sectionId: number): Promise<LlmGetProgressResponse> {
        const params: Record<string, string> = {
            action: 'get_progress',
            conversation_id: conversationId,
            section_id: sectionId.toString()
        };

        return this.selfhelpService.execServerRequest<LlmGetProgressResponse>(
            this.buildUrl(sectionId),
            params
        );
    }

    /**
     * Check for auto-started conversation
     * @param sectionId The section ID
     * @returns Promise resolving to auto-start data
     */
    async checkAutoStarted(sectionId: number): Promise<{
        auto_started: boolean;
        conversation?: LlmConversation;
        messages?: LlmMessage[];
    }> {
        const params: Record<string, string> = {
            action: 'get_auto_started',
            section_id: sectionId.toString()
        };

        return this.selfhelpService.execServerRequest<{
            auto_started: boolean;
            conversation?: LlmConversation;
            messages?: LlmMessage[];
            error?: string;
        }>(this.buildUrl(sectionId), params);
    }

    /**
     * Start auto conversation
     * @param sectionId The section ID
     * @returns Promise resolving to success status
     */
    async startAutoConversation(sectionId: number): Promise<{ success: boolean; error?: string }> {
        const params: Record<string, string> = {
            action: 'start_auto_conversation',
            section_id: sectionId.toString()
        };

        try {
            await this.selfhelpService.execServerRequest<{ success: boolean }>(
                this.buildUrl(sectionId),
                params
            );
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to start auto conversation'
            };
        }
    }

    /**
     * Build the URL for the LLM chat endpoint
     * Uses the current page URL since the LLM chat component
     * handles requests through its own controller
     * @param sectionId The section ID
     * @returns The URL string
     */
    private buildUrl(sectionId: number): string {
        // The LLM chat API is accessed through the page URL where the component is placed
        // We construct the full URL: server + current_url
        const currentUrl = this.selfhelpService.selfhelp.value.current_url;
        const serverUrl = this.selfhelpService.API_ENDPOINT_NATIVE;

        // Remove trailing slash from server URL and leading slash from current URL
        const cleanServerUrl = serverUrl.replace(/\/$/, '');
        let cleanCurrentUrl = currentUrl.replace(/^\//, '');

        // If current URL contains '/selfhelp/', extract just the page part
        if (cleanCurrentUrl.includes('/selfhelp/')) {
            cleanCurrentUrl = cleanCurrentUrl.split('/selfhelp/')[1];
        }

        return `${cleanServerUrl}/${cleanCurrentUrl}`;
    }

    /**
     * Convert a File to base64 string
     * @param file The file to convert
     * @returns Promise resolving to base64 string
     */
    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // Remove the data URL prefix (e.g., "data:image/png;base64,")
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Validate a file for upload
     * @param file The file to validate
     * @param config File configuration
     * @param existingHashes Set of existing file hashes (for duplicate detection)
     * @returns Validation result
     */
    async validateFile(
        file: File,
        config: LlmFileConfig,
        existingHashes: Set<string>
    ): Promise<{ valid: boolean; hash?: string; error?: string }> {
        // Check file size
        if (file.size > config.maxFileSize) {
            return {
                valid: false,
                error: `File "${file.name}" exceeds maximum size of ${this.formatBytes(config.maxFileSize)}`
            };
        }

        // Check for empty files
        if (file.size === 0) {
            return {
                valid: false,
                error: `File "${file.name}" is empty`
            };
        }

        // Check file extension
        const extension = this.getFileExtension(file.name);
        if (!config.allowedExtensions.includes(extension)) {
            return {
                valid: false,
                error: `File type ".${extension}" is not allowed`
            };
        }

        // Generate file hash for duplicate detection
        const hash = await this.generateFileHash(file);

        // Check for duplicates
        if (existingHashes.has(hash)) {
            return {
                valid: false,
                error: `File "${file.name}" is already attached`
            };
        }

        return { valid: true, hash };
    }

    /**
     * Generate a hash for a file (for duplicate detection)
     * @param file The file to hash
     * @returns Promise resolving to hash string
     */
    async generateFileHash(file: File): Promise<string> {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Get file extension from filename
     * @param filename The filename
     * @returns The extension (lowercase, without dot)
     */
    getFileExtension(filename: string): string {
        return filename.split('.').pop()?.toLowerCase() || '';
    }

    /**
     * Check if extension is an image
     * @param extension The file extension
     * @param allowedImageExtensions Array of allowed image extensions
     * @returns True if image extension
     */
    isImageExtension(extension: string, allowedImageExtensions: string[]): boolean {
        return allowedImageExtensions.includes(extension.toLowerCase());
    }

    /**
     * Format bytes to human-readable string
     * @param bytes Number of bytes
     * @returns Formatted string
     */
    formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    /**
     * Format file size for display
     * @param bytes Number of bytes
     * @returns Formatted string
     */
    formatFileSize(bytes: number): string {
        return this.formatBytes(bytes);
    }

    /**
     * Get Font Awesome icon class for file extension
     * @param extension The file extension
     * @returns Font Awesome icon class
     */
    getFileIcon(extension: string): string {
        const iconMap: Record<string, string> = {
            // Images
            jpg: 'fa-file-image',
            jpeg: 'fa-file-image',
            png: 'fa-file-image',
            gif: 'fa-file-image',
            webp: 'fa-file-image',
            // Documents
            pdf: 'fa-file-pdf',
            txt: 'fa-file-alt',
            md: 'fa-file-alt',
            csv: 'fa-file-csv',
            json: 'fa-file-code',
            xml: 'fa-file-code',
            // Code
            py: 'fa-file-code',
            js: 'fa-file-code',
            php: 'fa-file-code',
            html: 'fa-file-code',
            css: 'fa-file-code',
            sql: 'fa-file-code',
            sh: 'fa-file-code',
            yaml: 'fa-file-code',
            yml: 'fa-file-code'
        };
        return iconMap[extension.toLowerCase()] || 'fa-file';
    }

    /**
     * Truncate filename for display
     * @param filename The filename
     * @param maxLength Maximum length
     * @returns Truncated filename
     */
    truncateFileName(filename: string, maxLength: number = 20): string {
        if (filename.length <= maxLength) return filename;
        const extension = this.getFileExtension(filename);
        const nameWithoutExt = filename.slice(0, filename.lastIndexOf('.'));
        const truncatedName = nameWithoutExt.slice(0, maxLength - extension.length - 4) + '...';
        return `${truncatedName}.${extension}`;
    }
}
