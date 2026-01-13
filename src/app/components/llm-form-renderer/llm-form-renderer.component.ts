/**
 * LLM Form Renderer Component
 * ============================
 * 
 * Renders dynamic forms from LLM structured responses using Ionic components.
 * Supports:
 * - Radio buttons (ion-radio-group)
 * - Checkboxes (ion-checkbox)
 * - Select dropdowns (ion-select)
 * - Text inputs (ion-input)
 * - Textarea (ion-textarea)
 * - Number inputs (ion-input type=number)
 * - Scale inputs (ion-range)
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
    @Input() isSubmitted = false;

    @Output() formSubmit = new EventEmitter<{ values: Record<string, string | string[]>; readableText: string }>();

    // Form state
    formValues: Record<string, string | string[]> = {};
    formErrors: Record<string, string> = {};
    private initializedFormId: string | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['formDefinition'] && this.formDefinition) {
            // Only initialize once per form to preserve user input
            const currentFormId = this.formDefinition.title || 'default';
            if (this.initializedFormId !== currentFormId) {
                this.initializedFormId = currentFormId;
                this.initializeForm();
            }
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
     * Handle Ionic radio change
     */
    onIonRadioChange(field: LlmFormField, event: any): void {
        this.formValues[field.id] = event.detail.value;
        this.clearError(field.id);
    }

    /**
     * Handle Ionic checkbox change
     */
    onIonCheckboxChange(field: LlmFormField, value: string, event: any): void {
        const checked = event.detail.checked;
        const currentValues = (this.formValues[field.id] as string[]) || [];

        if (checked) {
            if (!currentValues.includes(value)) {
                this.formValues[field.id] = [...currentValues, value];
            }
        } else {
            this.formValues[field.id] = currentValues.filter(v => v !== value);
        }
        this.clearError(field.id);
    }

    /**
     * Handle Ionic select change
     */
    onIonSelectChange(field: LlmFormField, event: any): void {
        this.formValues[field.id] = event.detail.value;
        this.clearError(field.id);
    }

    /**
     * Handle Ionic input/textarea change
     */
    onIonInputChange(field: LlmFormField, event: any): void {
        this.formValues[field.id] = event.detail.value || '';
        this.clearError(field.id);
    }

    /**
     * Handle Ionic range change
     */
    onIonRangeChange(field: LlmFormField, event: any): void {
        this.formValues[field.id] = String(event.detail.value);
        this.clearError(field.id);
    }

    /**
     * Legacy handlers for backwards compatibility
     */
    onInputChange(field: LlmFormField, event: Event): void {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        this.formValues[field.id] = target.value;
        this.clearError(field.id);
    }

    onRadioChange(field: LlmFormField, value: string): void {
        this.formValues[field.id] = value;
        this.clearError(field.id);
    }

    onCheckboxChange(field: LlmFormField, value: string, event: Event): void {
        const target = event.target as HTMLInputElement;
        const currentValues = (this.formValues[field.id] as string[]) || [];

        if (target.checked) {
            if (!currentValues.includes(value)) {
                this.formValues[field.id] = [...currentValues, value];
            }
        } else {
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
                    if (!Array.isArray(value) || value.length === 0) {
                        this.formErrors[field.id] = 'Please select at least one option';
                        isValid = false;
                    }
                } else {
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
        if (this.isSubmitting || this.disabled || this.isSubmitted) return;

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
