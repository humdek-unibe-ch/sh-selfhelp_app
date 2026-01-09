import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { AlertController, ModalController, ActionSheetController, Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import {
    LlmChatStyle,
    LlmConversation,
    LlmMessage,
    LlmSelectedFile,
    LlmProgressData,
    LlmFileConfig,
    LlmFormDefinition,
    LlmStructuredResponse
} from 'src/app/selfhelpInterfaces';
import { LlmChatService, DEFAULT_FILE_CONFIG } from 'src/app/services/llm-chat.service';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-llm-chat-style',
    templateUrl: './llm-chat-style.component.html',
    styleUrls: ['./llm-chat-style.component.scss'],
})
export class LlmChatStyleComponent extends BasicStyleComponent implements OnInit, OnDestroy {
    @Input() override style!: LlmChatStyle;
    @ViewChild('messagesContainer') messagesContainer!: ElementRef;
    @ViewChild('messageTextarea') messageTextarea!: ElementRef;

    // State
    conversations: LlmConversation[] = [];
    currentConversation: LlmConversation | null = null;
    messages: LlmMessage[] = [];
    isLoading = false;
    isProcessing = false;
    isAutoStarting = false;
    isFormSubmitting = false;
    error: string | null = null;
    currentMessage = '';

    // File attachments
    selectedFiles: LlmSelectedFile[] = [];
    fileHashes: Set<string> = new Set();
    fileConfig: LlmFileConfig = DEFAULT_FILE_CONFIG;
    fileError: string | null = null;
    isDragging = false;
    attachmentIdCounter = 0;

    // Progress tracking
    progress: LlmProgressData | null = null;
    isProgressUpdating = false;

    // Form mode
    lastFailedFormSubmission: {
        values: Record<string, string | string[]>;
        readableText: string;
        conversationId: string | null;
        timestamp: number;
    } | null = null;

    // Floating mode
    isFloatingPanelOpen = false;

    // Smart scroll
    private isNearBottom = true;
    private readonly SCROLL_THRESHOLD = 100;

    // Character limit
    readonly MAX_MESSAGE_LENGTH = 4000;

    // ============================================================================
    // GETTERS FOR TEMPLATE BINDINGS
    // ============================================================================

    get acceptFileTypes(): string {
        return this.fileConfig.allowedExtensions.map(ext => '.' + ext).join(',');
    }

    get isTextareaDisabled(): boolean {
        return this.isProcessing || this.isLoading || this.isAutoStarting;
    }

    get isNearCharacterLimit(): boolean {
        return this.characterCount > (this.MAX_MESSAGE_LENGTH * 0.9);
    }

    get isVisionAttachEnabled(): boolean {
        return this.isFileUploadsEnabled() && this.isVisionModel();
    }

    get isVisionAttachDisabled(): boolean {
        return this.isProcessing || this.isLoading;
    }

    get attachFilesTitle(): string {
        return this.getLabel('attach_files_title', 'Attach files');
    }

    get noVisionSupportTitle(): string {
        return this.getLabel('no_vision_support_title', 'Current model does not support image uploads');
    }

    get clearButtonTitle(): string {
        return this.getLabel('clear_button_label', 'Clear');
    }

    get sendButtonTitle(): string {
        return this.getLabel('send_message_title', 'Send message');
    }

    get isSendButtonDisabled(): boolean {
        return this.isProcessing || this.isLoading || this.isAutoStarting || !this.currentMessage.trim();
    }

    constructor(
        public llmChatService: LlmChatService,
        private selfhelpService: SelfhelpService,
        private alertController: AlertController,
        private modalController: ModalController,
        private actionSheetController: ActionSheetController,
        private platform: Platform,
        private cdr: ChangeDetectorRef
    ) {
        super();
    }

    override ngOnInit() {
        this.initializeChat();
    }

    ngOnDestroy() {
        // Cleanup file preview URLs
        this.selectedFiles.forEach(file => {
            if (file.previewUrl) {
                URL.revokeObjectURL(file.previewUrl);
            }
        });
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

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
            const convs = await this.llmChatService.getConversations(this.getSectionId());
            this.conversations = convs;

            // Check for auto-start
            const shouldAutoStart = this.isAutoStartEnabled() &&
                convs.length === 0 &&
                !this.currentConversation;

            if (shouldAutoStart) {
                await this.handleAutoStart();
                return;
            }

            // Select first conversation if exists
            if (convs.length > 0 && !this.currentConversation) {
                await this.selectConversation(convs[0]);
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

            // Check for auto-start
            if (this.isAutoStartEnabled() && conversations.length === 0) {
                await this.handleAutoStart();
                return;
            }

            if (conversations.length > 0) {
                await this.selectConversation(conversations[0]);
            }
        } catch (err) {
            this.handleError(err);
        }
    }

    /**
     * Handle auto-start conversation
     */
    private async handleAutoStart(): Promise<void> {
        this.isAutoStarting = true;
        try {
            // Start auto conversation
            const startResult = await this.llmChatService.startAutoConversation(this.getSectionId());
            if (startResult.success) {
                // Wait a moment then check for the conversation
                await new Promise(resolve => setTimeout(resolve, 1000));

                const autoStarted = await this.llmChatService.checkAutoStarted(this.getSectionId());
                if (autoStarted.auto_started && autoStarted.conversation && autoStarted.messages) {
                    this.currentConversation = autoStarted.conversation;
                    this.messages = autoStarted.messages;

                    // Reload conversations list
                    const updatedConvs = await this.llmChatService.getConversations(this.getSectionId());
                    this.conversations = updatedConvs;

                    this.scrollToBottom(true);
                }
            }
        } catch (err) {
            console.debug('Auto-start failed:', err);
        } finally {
            this.isAutoStarting = false;
        }
    }

    // ============================================================================
    // CONVERSATION MANAGEMENT
    // ============================================================================

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

            // Load progress if enabled
            if (this.isProgressTrackingEnabled()) {
                await this.loadProgress(conversation.id);
            }

            this.scrollToBottom(true);
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
                        const title = data.title || this.generateDefaultTitle();
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
                                this.progress = null;
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
     * Generate default conversation title
     */
    private generateDefaultTitle(): string {
        const now = new Date();
        return 'Conversation ' + now.toLocaleDateString() + ' ' +
            now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // ============================================================================
    // MESSAGE SENDING
    // ============================================================================

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
            timestamp: new Date().toISOString(),
            attachments: this.selectedFiles.length > 0 ?
                JSON.stringify(Array(this.selectedFiles.length).fill({})) : undefined
        };
        this.messages.push(userMessage);

        // Clear input and files
        const filesToSend = [...this.selectedFiles];
        this.currentMessage = '';
        this.clearSelectedFiles();
        this.scrollToBottom(true);

        this.isProcessing = true;
        this.error = null;

        try {
            const result = await this.llmChatService.sendMessage(
                message,
                this.currentConversation?.id || null,
                this.getConfiguredModel(),
                this.getSectionId(),
                filesToSend
            );

            if (result.error) {
                throw new Error(result.error);
            }

            // Handle blocked/danger detection
            if (result.blocked && result.type === 'danger_detected') {
                // Update conversation as blocked
                if (this.currentConversation) {
                    this.currentConversation = {
                        ...this.currentConversation,
                        blocked: true,
                        blocked_reason: 'Safety concerns detected'
                    };
                }
                // Show safety message
                if (result.message) {
                    const safetyMessage: LlmMessage = {
                        id: 'safety-' + Date.now(),
                        role: 'assistant',
                        content: result.message,
                        timestamp: new Date().toISOString()
                    };
                    this.messages.push(safetyMessage);
                }
                this.scrollToBottom(true);
                return;
            }

            // Update progress if included
            if (result.progress && this.isProgressTrackingEnabled()) {
                this.progress = result.progress;
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

            this.scrollToBottom(true);
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
     * Clear the message input
     */
    clearInput(): void {
        this.currentMessage = '';
        this.clearSelectedFiles();
        this.fileError = null;
    }

    // ============================================================================
    // FILE ATTACHMENTS
    // ============================================================================

    /**
     * Handle file selection from input
     */
    async onFileSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            await this.handleFileSelection(Array.from(input.files));
        }
        // Reset input
        input.value = '';
    }

    /**
     * Handle file selection
     */
    async handleFileSelection(files: File[]): Promise<void> {
        this.fileError = null;

        // Check total files limit
        const currentCount = this.selectedFiles.length;
        const newCount = files.length;
        const totalCount = currentCount + newCount;

        if (totalCount > this.fileConfig.maxFilesPerMessage) {
            this.fileError = `Maximum ${this.fileConfig.maxFilesPerMessage} files allowed per message`;
            return;
        }

        // Validate and process each file
        const validFiles: LlmSelectedFile[] = [];
        const errors: string[] = [];

        for (const file of files) {
            const result = await this.llmChatService.validateFile(file, this.fileConfig, this.fileHashes);

            if (result.valid && result.hash) {
                const attachmentId = `attach_${++this.attachmentIdCounter}_${Date.now()}`;

                // Generate preview for images
                let previewUrl: string | undefined;
                const extension = this.llmChatService.getFileExtension(file.name);
                if (this.llmChatService.isImageExtension(extension, this.fileConfig.allowedImageExtensions)) {
                    previewUrl = await this.readFileAsDataUrl(file);
                }

                validFiles.push({
                    id: attachmentId,
                    file,
                    hash: result.hash,
                    previewUrl
                });

                this.fileHashes.add(result.hash);
            } else if (result.error) {
                errors.push(result.error);
            }
        }

        // Show first error if any
        if (errors.length > 0) {
            this.fileError = errors[0];
        }

        // Add valid files
        if (validFiles.length > 0) {
            this.selectedFiles = [...this.selectedFiles, ...validFiles];
        }
    }

    /**
     * Read file as data URL for preview
     */
    private readFileAsDataUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Remove a file attachment
     */
    removeFile(attachmentId: string): void {
        const file = this.selectedFiles.find(f => f.id === attachmentId);
        if (file) {
            this.fileHashes.delete(file.hash);
            if (file.previewUrl) {
                URL.revokeObjectURL(file.previewUrl);
            }
        }
        this.selectedFiles = this.selectedFiles.filter(f => f.id !== attachmentId);
    }

    /**
     * Clear all selected files
     */
    clearSelectedFiles(): void {
        this.selectedFiles.forEach(file => {
            if (file.previewUrl) {
                URL.revokeObjectURL(file.previewUrl);
            }
        });
        this.selectedFiles = [];
        this.fileHashes.clear();
        this.fileError = null;
    }

    /**
     * Open file picker with action sheet for mobile
     */
    async openFilePicker(): Promise<void> {
        if (this.platform.is('capacitor')) {
            // Mobile - show action sheet with options
            const actionSheet = await this.actionSheetController.create({
                header: this.getLabel('attach_files_title', 'Attach files'),
                buttons: [
                    {
                        text: 'Take Photo',
                        icon: 'camera',
                        handler: () => {
                            this.takePhoto();
                        }
                    },
                    {
                        text: 'Choose from Gallery',
                        icon: 'images',
                        handler: () => {
                            this.pickFromGallery();
                        }
                    },
                    {
                        text: 'Choose File',
                        icon: 'document',
                        handler: () => {
                            this.triggerFileInput();
                        }
                    },
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        icon: 'close'
                    }
                ]
            });
            await actionSheet.present();
        } else {
            // Web - trigger file input directly
            this.triggerFileInput();
        }
    }

    /**
     * Trigger the hidden file input
     */
    private triggerFileInput(): void {
        const fileInput = document.getElementById('llm-chat-file-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    }

    /**
     * Take a photo using the camera
     */
    async takePhoto(): Promise<void> {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera
            });

            if (image.dataUrl) {
                const blob = await this.dataUrlToBlob(image.dataUrl);
                const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
                await this.handleFileSelection([file]);
            }
        } catch (err) {
            console.error('Camera error:', err);
        }
    }

    /**
     * Pick image from gallery
     */
    async pickFromGallery(): Promise<void> {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Photos
            });

            if (image.dataUrl) {
                const blob = await this.dataUrlToBlob(image.dataUrl);
                const file = new File([blob], `image_${Date.now()}.jpg`, { type: 'image/jpeg' });
                await this.handleFileSelection([file]);
            }
        } catch (err) {
            console.error('Gallery error:', err);
        }
    }

    /**
     * Convert data URL to Blob
     */
    private async dataUrlToBlob(dataUrl: string): Promise<Blob> {
        const response = await fetch(dataUrl);
        return response.blob();
    }

    // Drag and drop handlers
    onDragOver(event: DragEvent): void {
        event.preventDefault();
        if (this.isFileUploadsEnabled() && this.isVisionModel()) {
            this.isDragging = true;
        }
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        this.isDragging = false;
    }

    async onDrop(event: DragEvent): Promise<void> {
        event.preventDefault();
        this.isDragging = false;

        if (!this.isFileUploadsEnabled() || !this.isVisionModel()) return;

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            await this.handleFileSelection(Array.from(files));
        }
    }

    // ============================================================================
    // FORM MODE
    // ============================================================================

    /**
     * Handle form submission
     */
    async handleFormSubmit(values: Record<string, string | string[]>, readableText: string): Promise<void> {
        if (this.isFormSubmitting) return;

        // Add user message to UI
        const userMessage: LlmMessage = {
            id: 'temp_form_' + Date.now(),
            role: 'user',
            content: readableText,
            timestamp: new Date().toISOString()
        };
        this.messages.push(userMessage);
        this.scrollToBottom(true);

        this.isFormSubmitting = true;
        this.isProcessing = true;
        this.lastFailedFormSubmission = null;

        try {
            const result = await this.llmChatService.submitForm(
                values,
                readableText,
                this.currentConversation?.id || null,
                this.getConfiguredModel(),
                this.getSectionId()
            );

            if (result.error) {
                throw new Error(result.error);
            }

            // Update progress if included
            if (result.progress && this.isProgressTrackingEnabled()) {
                this.progress = result.progress;
            }

            // Refresh messages
            if (result.conversation_id) {
                const conversationResult = await this.llmChatService.getConversation(
                    result.conversation_id,
                    this.getSectionId()
                );
                this.currentConversation = conversationResult.conversation;
                this.messages = conversationResult.messages;

                if (this.isConversationsListEnabled()) {
                    await this.loadConversations();
                }
            }

            this.scrollToBottom(true);
        } catch (err) {
            this.handleError(err);
            // Track failed submission for retry
            this.lastFailedFormSubmission = {
                values,
                readableText,
                conversationId: this.currentConversation?.id || null,
                timestamp: Date.now()
            };
        } finally {
            this.isFormSubmitting = false;
            this.isProcessing = false;
        }
    }

    /**
     * Handle Continue button click (form mode)
     */
    async handleContinue(): Promise<void> {
        if (this.isProcessing || !this.currentConversation) return;

        this.isProcessing = true;
        this.isFormSubmitting = true;

        try {
            const result = await this.llmChatService.continueConversation(
                this.currentConversation.id,
                this.getConfiguredModel(),
                this.getSectionId()
            );

            if (result.error) {
                throw new Error(result.error);
            }

            // Update progress if included
            if (result.progress && this.isProgressTrackingEnabled()) {
                this.progress = result.progress;
            }

            // Refresh messages
            const conversationResult = await this.llmChatService.getConversation(
                this.currentConversation.id,
                this.getSectionId()
            );
            this.currentConversation = conversationResult.conversation;
            this.messages = conversationResult.messages;

            this.scrollToBottom(true);
        } catch (err) {
            this.handleError(err);
        } finally {
            this.isProcessing = false;
            this.isFormSubmitting = false;
        }
    }

    /**
     * Retry failed form submission
     */
    async retryFormSubmission(): Promise<void> {
        if (!this.lastFailedFormSubmission) return;

        const { values, readableText } = this.lastFailedFormSubmission;
        this.lastFailedFormSubmission = null;
        await this.handleFormSubmit(values, readableText);
    }

    // ============================================================================
    // PROGRESS TRACKING
    // ============================================================================

    /**
     * Load progress data for a conversation
     */
    async loadProgress(conversationId: string): Promise<void> {
        if (!this.isProgressTrackingEnabled()) return;

        this.isProgressUpdating = true;
        try {
            const response = await this.llmChatService.getProgress(conversationId, this.getSectionId());
            if (response.progress) {
                this.progress = response.progress;
            }
        } catch (err) {
            console.error('Failed to load progress:', err);
        } finally {
            this.isProgressUpdating = false;
        }
    }

    /**
     * Get progress bar color based on percentage
     */
    getProgressColor(percentage: number): string {
        if (percentage >= 100) return 'success';
        if (percentage >= 75) return 'tertiary';
        if (percentage >= 50) return 'primary';
        if (percentage >= 25) return 'warning';
        return 'medium';
    }

    // ============================================================================
    // FLOATING MODE
    // ============================================================================

    /**
     * Toggle floating chat panel
     */
    toggleFloatingPanel(): void {
        this.isFloatingPanelOpen = !this.isFloatingPanelOpen;
        if (this.isFloatingPanelOpen) {
            setTimeout(() => this.scrollToBottom(true), 300);
        }
    }

    /**
     * Close floating panel
     */
    closeFloatingPanel(): void {
        this.isFloatingPanelOpen = false;
    }

    // ============================================================================
    // SMART SCROLL
    // ============================================================================

    /**
     * Handle scroll event
     */
    onScroll(): void {
        if (!this.messagesContainer?.nativeElement) return;

        const container = this.messagesContainer.nativeElement;
        const { scrollTop, scrollHeight, clientHeight } = container;
        this.isNearBottom = scrollHeight - scrollTop - clientHeight < this.SCROLL_THRESHOLD;
    }

    /**
     * Scroll messages container to bottom
     */
    private scrollToBottom(force = false): void {
        // Only scroll if user was already at bottom (or force is true)
        if (!force && !this.isNearBottom) return;

        setTimeout(() => {
            if (this.messagesContainer?.nativeElement) {
                this.messagesContainer.nativeElement.scrollTo({
                    top: this.messagesContainer.nativeElement.scrollHeight,
                    behavior: 'smooth'
                });
                this.isNearBottom = true;
            }
            // Also scroll ion-content if available
            if (this.ionContent) {
                this.ionContent.scrollToBottom(300);
            }
        }, 100);
    }

    // ============================================================================
    // ERROR HANDLING
    // ============================================================================

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

        // Auto-dismiss error after 6 seconds
        setTimeout(() => {
            if (this.error) {
                this.clearError();
            }
        }, 6000);
    }

    /**
     * Clear error
     */
    clearError(): void {
        this.error = null;
    }

    /**
     * Clear file error
     */
    clearFileError(): void {
        this.fileError = null;
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
     * Check if file uploads are enabled
     */
    isFileUploadsEnabled(): boolean {
        return this.getFieldContent('enable_file_uploads') === '1';
    }

    /**
     * Check if form mode is enabled
     */
    isFormModeEnabled(): boolean {
        return this.getFieldContent('enable_form_mode') === '1';
    }

    /**
     * Check if progress tracking is enabled
     */
    isProgressTrackingEnabled(): boolean {
        return this.getFieldContent('enable_progress_tracking') === '1';
    }

    /**
     * Check if floating button is enabled
     */
    isFloatingButtonEnabled(): boolean {
        return this.getFieldContent('enable_floating_button') === '1';
    }

    /**
     * Check if auto-start is enabled
     */
    isAutoStartEnabled(): boolean {
        return this.getFieldContent('auto_start_conversation') === '1';
    }

    /**
     * Check if current model supports vision
     */
    isVisionModel(): boolean {
        const model = this.getConfiguredModel();
        return this.fileConfig.visionModels.includes(model);
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
     * Format date for conversation list
     */
    formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
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
     * Get floating button position class
     */
    getFloatingButtonPosition(): string {
        return this.getFieldContent('floating_button_position') || 'bottom-right';
    }

    /**
     * Get floating button icon
     */
    getFloatingButtonIcon(): string {
        const icon = this.getFieldContent('floating_button_icon') || 'fa-comments';
        // Convert Font Awesome to Ionic icon if needed
        return icon.replace('fa-', '').replace('-outline', '');
    }

    /**
     * Get files attached text
     */
    getFilesAttachedText(): string {
        if (this.selectedFiles.length === 1) {
            return this.getLabel('single_file_attached_text', '1 file attached');
        }
        return this.getLabel('multiple_files_attached_text', '{count} files attached')
            .replace('{count}', this.selectedFiles.length.toString());
    }

    /**
     * Check if message has attachments
     */
    getAttachmentCount(message: LlmMessage): number {
        if (!message.attachments) return 0;
        try {
            const parsed = JSON.parse(message.attachments);
            return Array.isArray(parsed) ? parsed.length : (parsed ? 1 : 0);
        } catch {
            return 0;
        }
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

    /**
     * Track by function for files
     */
    trackByFileId(index: number, file: LlmSelectedFile): string {
        return file.id;
    }

    /**
     * Get character count
     */
    get characterCount(): number {
        return this.currentMessage.length;
    }

}
