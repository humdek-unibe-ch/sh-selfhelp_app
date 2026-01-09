/**
 * LLM Form Renderer Component
 * ============================
 * 
 * Renders dynamic forms from LLM structured responses.
 * Supports:
 * - Radio buttons (single select)
 * - Checkboxes (multi-select)
 * - Select dropdowns
 * - Text inputs
 * - Textarea
 * - Number inputs
 * - Scale inputs
 * 
 * @module components/LlmFormRenderer
 */

import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { LlmFormDefinition, LlmFormField, LlmFormFieldOption } from 'src/app/selfhelpInterfaces';

@Component({
    selector: 'app-llm-form-renderer',
    templateUrl: './llm-form-renderer.component.html',
    styleUrls: ['./llm-form-renderer.component.scss']
})
export class LlmFormRendererComponent implements OnChanges {
    @Input() formDefinition!: LlmFormDefinition;
    @Input() isSubmitting = false;
    @Input() disabled = false;

    @Output() formSubmit = new EventEmitter<{ values: Record<string, string | string[]>; readableText: string }>();

    // Form state
    formValues: Record<string, string | string[]> = {};
    formErrors: Record<string, string> = {};

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['formDefinition'] && this.formDefinition) {
            this.initializeForm();
        }
    }

    /**
     * Initialize form with default values
     */
    private initializeForm(): void {
        this.formValues = {};
        this.formErrors = {};

        if (!this.formDefinition?.fields) return;

        for (const field of this.formDefinition.fields) {
            if (field.type === 'checkbox') {
                // Checkboxes default to empty array
                this.formValues[field.id] = [];
            } else if (field.value) {
                // Use default value if provided
                this.formValues[field.id] = field.value;
            } else {
                // Default to empty string
                this.formValues[field.id] = '';
            }
        }
    }

    /**
     * Handle text/number input change
     */
    onInputChange(field: LlmFormField, event: Event): void {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        this.formValues[field.id] = target.value;
        this.clearError(field.id);
    }

    /**
     * Handle radio button change
     */
    onRadioChange(field: LlmFormField, value: string): void {
        this.formValues[field.id] = value;
        this.clearError(field.id);
    }

    /**
     * Handle checkbox change
     */
    onCheckboxChange(field: LlmFormField, value: string, event: Event): void {
        const target = event.target as HTMLInputElement;
        const currentValues = (this.formValues[field.id] as string[]) || [];

        if (target.checked) {
            // Add value
            if (!currentValues.includes(value)) {
                this.formValues[field.id] = [...currentValues, value];
            }
        } else {
            // Remove value
            this.formValues[field.id] = currentValues.filter(v => v !== value);
        }
        this.clearError(field.id);
    }

    /**
     * Check if a checkbox option is checked
     */
    isCheckboxChecked(field: LlmFormField, value: string): boolean {
        const values = this.formValues[field.id];
        return Array.isArray(values) && values.includes(value);
    }

    /**
     * Check if a radio option is selected
     */
    isRadioSelected(field: LlmFormField, value: string): boolean {
        return this.formValues[field.id] === value;
    }

    /**
     * Clear error for a field
     */
    private clearError(fieldId: string): void {
        if (this.formErrors[fieldId]) {
            delete this.formErrors[fieldId];
        }
    }

    /**
     * Validate form
     */
    private validateForm(): boolean {
        this.formErrors = {};
        let isValid = true;

        if (!this.formDefinition?.fields) return true;

        for (const field of this.formDefinition.fields) {
            if (field.required) {
                const value = this.formValues[field.id];

                if (field.type === 'checkbox') {
                    // Checkbox requires at least one selection
                    if (!Array.isArray(value) || value.length === 0) {
                        this.formErrors[field.id] = 'Please select at least one option';
                        isValid = false;
                    }
                } else {
                    // Other fields require non-empty value
                    if (!value || (typeof value === 'string' && !value.trim())) {
                        this.formErrors[field.id] = 'This field is required';
                        isValid = false;
                    }
                }
            }
        }

        return isValid;
    }

    /**
     * Format form values as readable text
     */
    private formatAsReadableText(): string {
        const parts: string[] = [];

        if (this.formDefinition.title) {
            parts.push(`**${this.formDefinition.title}**`);
            parts.push('');
        }

        for (const field of this.formDefinition.fields || []) {
            const value = this.formValues[field.id];

            if (!value || (Array.isArray(value) && value.length === 0)) {
                continue;
            }

            // Handle text/textarea/number fields
            if (['text', 'textarea', 'number'].includes(field.type)) {
                if (typeof value === 'string' && value.trim()) {
                    parts.push(`${field.label}: ${value}`);
                }
                continue;
            }

            // Handle selection fields (radio, checkbox, select)
            const selectedValues = Array.isArray(value) ? value : [value];
            const selectedLabels = selectedValues
                .map(val => {
                    const option = field.options?.find(opt => opt.value === val);
                    return option?.label || val;
                })
                .filter(Boolean);

            if (selectedLabels.length > 0) {
                if (selectedLabels.length === 1) {
                    parts.push(`${field.label}: ${selectedLabels[0]}`);
                } else {
                    parts.push(`${field.label}: ${selectedLabels.join(', ')}`);
                }
            }
        }

        if (parts.length === 0 || (parts.length === 2 && parts[1] === '')) {
            return 'Form submitted';
        }

        return parts.join('\n');
    }

    /**
     * Handle form submission
     */
    onSubmit(): void {
        if (this.isSubmitting || this.disabled) return;

        if (!this.validateForm()) {
            return;
        }

        const readableText = this.formatAsReadableText();

        this.formSubmit.emit({
            values: { ...this.formValues },
            readableText
        });
    }

    /**
     * Track by for fields
     */
    trackByFieldId(index: number, field: LlmFormField): string {
        return field.id;
    }

    /**
     * Track by for options
     */
    trackByOptionValue(index: number, option: LlmFormFieldOption): string {
        return option.value;
    }

    /**
     * Get submit button label
     */
    get submitLabel(): string {
        return this.formDefinition?.submitLabel || 'Submit';
    }
}
