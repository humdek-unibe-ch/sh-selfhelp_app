/**
 * LLM Structured Response Renderer Component
 * ==========================================
 * 
 * Renders structured JSON responses from the LLM.
 * Supports:
 * - Text blocks with different types (paragraph, heading, list, etc.)
 * - Optional forms that users can fill out
 * - Media items (images, videos)
 * - Next step suggestions (quick reply buttons)
 * - Progress milestone celebrations
 * 
 * @module components/LlmStructuredResponse
 */

import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import {
    LlmStructuredResponse,
    LlmTextBlock,
    LlmStructuredForm,
    LlmNextStep,
    LlmFormDefinition,
    LlmFormField
} from 'src/app/selfhelpInterfaces';

@Component({
    selector: 'app-llm-structured-response',
    templateUrl: './llm-structured-response.component.html',
    styleUrls: ['./llm-structured-response.component.scss']
})
export class LlmStructuredResponseComponent implements OnChanges {
    @Input() response!: LlmStructuredResponse;
    @Input() isLastMessage = false;
    @Input() isFormSubmitting = false;

    @Output() formSubmit = new EventEmitter<{ values: Record<string, string | string[]>; readableText: string }>();
    @Output() suggestionClick = new EventEmitter<string>();

    // Parsed data
    textBlocks: LlmTextBlock[] = [];
    forms: LlmStructuredForm[] = [];
    mediaItems: { type: string; src: string; alt?: string; caption?: string }[] = [];
    nextStep: LlmNextStep | null = null;
    milestone: string | null = null;
    newlyCovered: string[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['response'] && this.response) {
            this.parseResponse();
        }
    }

    /**
     * Parse the structured response
     */
    private parseResponse(): void {
        const { content, meta } = this.response;

        // Text blocks
        this.textBlocks = content.text_blocks || [];

        // Forms
        this.forms = content.forms || [];

        // Media items
        this.mediaItems = (content.media || []).map(m => ({
            type: m.type,
            src: m.src,
            alt: m.alt,
            caption: m.caption
        }));

        // Next step
        this.nextStep = content.next_step || null;

        // Progress info
        this.milestone = meta?.progress?.milestone || null;
        this.newlyCovered = meta?.progress?.newly_covered || [];
    }

    /**
     * Get CSS class for text block type
     */
    getTextBlockClass(block: LlmTextBlock): string {
        const baseClass = 'structured-text-block';
        const typeClass = `structured-${block.type}`;
        return `${baseClass} ${typeClass}`;
    }

    /**
     * Get alert class for special block types
     */
    getAlertClass(type: string): string {
        const alertMap: Record<string, string> = {
            'info': 'alert-info',
            'warning': 'alert-warning',
            'success': 'alert-success',
            'tip': 'alert-secondary'
        };
        return alertMap[type] || '';
    }

    /**
     * Check if block type is an alert type
     */
    isAlertType(type: string): boolean {
        return ['info', 'warning', 'success', 'tip'].includes(type);
    }

    /**
     * Get icon for alert type
     */
    getAlertIcon(type: string): string {
        const iconMap: Record<string, string> = {
            'info': 'information-circle-outline',
            'warning': 'warning-outline',
            'success': 'checkmark-circle-outline',
            'tip': 'bulb-outline'
        };
        return iconMap[type] || 'information-circle-outline';
    }

    /**
     * Handle suggestion button click
     */
    onSuggestionClick(suggestion: string): void {
        if (suggestion && typeof suggestion === 'string') {
            this.suggestionClick.emit(suggestion);
        }
    }

    /**
     * Handle form submission from child component
     */
    onFormSubmit(data: { values: Record<string, string | string[]>; readableText: string }): void {
        this.formSubmit.emit(data);
    }

    /**
     * Convert structured form to form definition for the form renderer
     */
    toFormDefinition(form: LlmStructuredForm): LlmFormDefinition {
        return {
            type: 'form',
            title: form.title,
            description: form.description,
            fields: form.fields,
            submitLabel: form.submit_label
        };
    }

    /**
     * Track by for text blocks
     */
    trackByIndex(index: number): number {
        return index;
    }

    /**
     * Track by for forms
     */
    trackByFormId(index: number, form: LlmStructuredForm): string {
        return form.id || `form-${index}`;
    }
}
