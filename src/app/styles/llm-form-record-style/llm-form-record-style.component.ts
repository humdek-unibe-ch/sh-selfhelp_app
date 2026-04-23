import { Component } from '@angular/core';
import { LlmFormStyleComponent } from '../llm-form-style/llm-form-style.component';

/**
 * Concrete style component for the `llmFormRecord` style.
 * Reuses the base `LlmFormStyleComponent` template/styles as-is; the
 * backend (`LlmFormController` + `LlmFormModel`) handles the record-mode
 * semantics (one row per user, updated on submit).
 */
@Component({
    selector: 'app-llm-form-record-style',
    templateUrl: '../llm-form-style/llm-form-style.component.html',
    styleUrls: ['../llm-form-style/llm-form-style.component.scss'],
    standalone: false
})
export class LlmFormRecordStyleComponent extends LlmFormStyleComponent { }
