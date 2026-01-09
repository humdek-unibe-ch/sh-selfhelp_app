import { Injectable } from '@angular/core';
import { SelfhelpService } from './selfhelp.service';
import {
    LlmConversation,
    LlmMessage,
    LlmGetConversationsResponse,
    LlmGetConversationResponse,
    LlmSendMessageResponse,
    LlmNewConversationResponse,
    LlmDeleteConversationResponse
} from '../selfhelpInterfaces';

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
        const params = {
            action: 'get_conversations',
            section_id: sectionId.toString()
        };
        const response = await this.selfhelpService.execServerRequest<LlmGetConversationsResponse>(
            this.buildUrl(sectionId),
            params
        );
        if (response.error) {
            throw new Error(response.error);
        }
        return response.conversations || [];
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
     * @returns Promise resolving to send result
     */
    async sendMessage(
        message: string,
        conversationId: string | null,
        model: string,
        sectionId: number
    ): Promise<LlmSendMessageResponse> {
        const params: any = {
            action: 'send_message',
            message: message,
            model: model,
            section_id: sectionId.toString()
        };
        if (conversationId) {
            params.conversation_id = conversationId;
        }
        return this.selfhelpService.execServerRequest<LlmSendMessageResponse>(
            this.buildUrl(sectionId),
            params
        );
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
        // We use the selfhelp base path with the current URL
        return this.selfhelpService.selfhelp.value.current_url;
    }
}
