import { Component } from '@angular/core';
import { LlmFormStyleComponent } from '../llm-form-style/llm-form-style.component';

/**
 * Concrete style component for the `llmFormLog` style.
 * Reuses the base `LlmFormStyleComponent` template/styles; the backend
 * handles the log-mode semantics (append-only, new row per submission).
 */
@Component({
    selector: 'app-llm-form-log-style',
    templateUrl: '../llm-form-style/llm-form-style.component.html',
    styleUrls: ['../llm-form-style/llm-form-style.component.scss'],
    standalone: false
})
export class LlmFormLogStyleComponent extends LlmFormStyleComponent { }
