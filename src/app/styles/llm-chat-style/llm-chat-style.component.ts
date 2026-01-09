import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { LlmChatStyle, LlmConversation, LlmMessage } from 'src/app/selfhelpInterfaces';
import { LlmChatService } from 'src/app/services/llm-chat.service';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-llm-chat-style',
    templateUrl: './llm-chat-style.component.html',
    styleUrls: ['./llm-chat-style.component.scss'],
})
export class LlmChatStyleComponent extends BasicStyleComponent implements OnInit, OnDestroy {
    @Input() override style!: LlmChatStyle;
    @ViewChild('messagesContainer') messagesContainer!: ElementRef;

    // State
    conversations: LlmConversation[] = [];
    currentConversation: LlmConversation | null = null;
    messages: LlmMessage[] = [];
    isLoading = false;
    isProcessing = false;
    error: string | null = null;
    currentMessage = '';

    constructor(
        private llmChatService: LlmChatService,
        private selfhelpService: SelfhelpService,
        private alertController: AlertController
    ) {
        super();
    }

    override ngOnInit() {
        this.initializeChat();
    }

    ngOnDestroy() {
        // Cleanup if needed
    }

    /**
     * Initialize the chat component
     */
    private async initializeChat(): Promise<void> {
        this.isLoading = true;
        try {
            if (this.isConversationsListEnabled()) {
                await this.loadConversations();
            } else {
                // Single conversation mode - load or create
                await this.loadOrCreateConversation();
            }
        } catch (err) {
            this.handleError(err);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Load all conversations for the user
     */
    async loadConversations(): Promise<void> {
        try {
            this.conversations = await this.llmChatService.getConversations(this.getSectionId());
            // Select first conversation if exists
            if (this.conversations.length > 0 && !this.currentConversation) {
                await this.selectConversation(this.conversations[0]);
            }
        } catch (err) {
            this.handleError(err);
        }
    }

    /**
     * Load or create a conversation in single-conversation mode
     */
    private async loadOrCreateConversation(): Promise<void> {
        try {
            const conversations = await this.llmChatService.getConversations(this.getSectionId());
            if (conversations.length > 0) {
                await this.selectConversation(conversations[0]);
            }
        } catch (err) {
            this.handleError(err);
        }
    }

    /**
     * Select a conversation and load its messages
     */
    async selectConversation(conversation: LlmConversation): Promise<void> {
        this.isLoading = true;
        try {
            const result = await this.llmChatService.getConversation(
                conversation.id,
                this.getSectionId()
            );
            this.currentConversation = result.conversation;
            this.messages = result.messages;
            this.scrollToBottom();
        } catch (err) {
            this.handleError(err);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Create a new conversation
     */
    async createConversation(): Promise<void> {
        const alert = await this.alertController.create({
            header: this.getLabel('new_conversation_title_label', 'New Conversation'),
            inputs: [
                {
                    name: 'title',
                    type: 'text',
                    placeholder: this.getLabel('conversation_title_placeholder', 'Enter conversation title (optional)')
                }
            ],
            buttons: [
                {
                    text: this.getLabel('cancel_button_label', 'Cancel'),
                    role: 'cancel'
                },
                {
                    text: this.getLabel('create_button_label', 'Create'),
                    handler: async (data) => {
                        const title = data.title || this.getLabel('default_chat_title', 'AI Chat');
                        try {
                            const conversationId = await this.llmChatService.createConversation(
                                title,
                                this.getConfiguredModel(),
                                this.getSectionId()
                            );
                            await this.loadConversations();
                            // Select the new conversation
                            const newConversation = this.conversations.find(c => c.id === conversationId);
                            if (newConversation) {
                                await this.selectConversation(newConversation);
                            }
                        } catch (err) {
                            this.handleError(err);
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    /**
     * Delete a conversation
     */
    async deleteConversation(conversation: LlmConversation, event: Event): Promise<void> {
        event.stopPropagation();
        const alert = await this.alertController.create({
            header: this.getLabel('delete_confirmation_title', 'Delete Conversation'),
            message: this.getLabel('delete_confirmation_message', 'Are you sure you want to delete this conversation?'),
            buttons: [
                {
                    text: this.getLabel('cancel_delete_button_label', 'Cancel'),
                    role: 'cancel'
                },
                {
                    text: this.getLabel('confirm_delete_button_label', 'Delete'),
                    cssClass: 'danger',
                    handler: async () => {
                        try {
                            await this.llmChatService.deleteConversation(
                                conversation.id,
                                this.getSectionId()
                            );
                            // Clear current if deleted
                            if (this.currentConversation?.id === conversation.id) {
                                this.currentConversation = null;
                                this.messages = [];
                            }
                            await this.loadConversations();
                        } catch (err) {
                            this.handleError(err);
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    /**
     * Send a message
     */
    async sendMessage(): Promise<void> {
        const message = this.currentMessage.trim();
        if (!message) {
            this.error = this.getLabel('empty_message_error', 'Please enter a message');
            return;
        }

        if (this.isProcessing) {
            return;
        }

        // Add user message to UI immediately
        const userMessage: LlmMessage = {
            id: 'temp_' + Date.now(),
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };
        this.messages.push(userMessage);
        this.currentMessage = '';
        this.scrollToBottom();

        this.isProcessing = true;
        this.error = null;

        try {
            const result = await this.llmChatService.sendMessage(
                message,
                this.currentConversation?.id || null,
                this.getConfiguredModel(),
                this.getSectionId()
            );

            if (result.error) {
                throw new Error(result.error);
            }

            // Handle blocked/danger detection
            if (result.blocked && result.type === 'danger_detected') {
                // Show safety message
                this.selfhelpService.presentToast(
                    this.getLabel('danger_blocked_message', 'Your message contains concerning content.'),
                    'warning'
                );
            }

            // Reload messages to get the AI response
            if (result.conversation_id) {
                const conversationResult = await this.llmChatService.getConversation(
                    result.conversation_id,
                    this.getSectionId()
                );
                this.currentConversation = conversationResult.conversation;
                this.messages = conversationResult.messages;

                // If this was a new conversation, reload the list
                if (result.is_new_conversation && this.isConversationsListEnabled()) {
                    await this.loadConversations();
                }
            }

            this.scrollToBottom();
        } catch (err) {
            // Remove the temporary user message on error
            this.messages = this.messages.filter(m => m.id !== userMessage.id);
            this.handleError(err);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Handle keyboard enter to send message
     */
    onKeyPress(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    /**
     * Scroll messages container to bottom
     */
    private scrollToBottom(): void {
        setTimeout(() => {
            if (this.messagesContainer?.nativeElement) {
                this.messagesContainer.nativeElement.scrollTop =
                    this.messagesContainer.nativeElement.scrollHeight;
            }
            // Also scroll ion-content if available
            if (this.ionContent) {
                this.ionContent.scrollToBottom(300);
            }
        }, 100);
    }

    /**
     * Handle errors
     */
    private handleError(err: unknown): void {
        if (err instanceof Error) {
            this.error = err.message;
        } else {
            this.error = 'An unexpected error occurred';
        }
        console.error('LLM Chat Error:', err);
    }

    /**
     * Clear error
     */
    clearError(): void {
        this.error = null;
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    /**
     * Get section ID from style
     */
    getSectionId(): number {
        return this.style.section_id || parseInt(this.style.id?.content?.toString() || '0');
    }

    /**
     * Get configured model
     */
    getConfiguredModel(): string {
        return this.getFieldContent('llm_model') || 'default';
    }

    /**
     * Check if conversations list is enabled
     */
    isConversationsListEnabled(): boolean {
        return this.getFieldContent('enable_conversations_list') === '1';
    }

    /**
     * Check if conversation is blocked
     */
    isConversationBlocked(): boolean {
        return this.currentConversation?.blocked === true ||
            this.currentConversation?.blocked === 1;
    }

    /**
     * Get a label with fallback to default
     */
    getLabel(fieldName: string, defaultValue: string): string {
        const content = this.getFieldContent(fieldName);
        return content || defaultValue;
    }

    /**
     * Format timestamp for display
     */
    formatTimestamp(timestamp: string): string {
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    }

    /**
     * Check if message is from user
     */
    isUserMessage(message: LlmMessage): boolean {
        return message.role === 'user';
    }

    /**
     * Get chat title
     */
    getChatTitle(): string {
        return this.currentConversation?.title ||
            this.getLabel('default_chat_title', 'AI Chat');
    }

    /**
     * Track by function for ngFor
     */
    trackByMessageId(index: number, message: LlmMessage): string {
        return message.id;
    }

    /**
     * Track by function for conversations
     */
    trackByConversationId(index: number, conversation: LlmConversation): string {
        return conversation.id;
    }
}
