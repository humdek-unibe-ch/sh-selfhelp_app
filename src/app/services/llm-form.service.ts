import { Injectable } from '@angular/core';
import { SelfhelpService } from './selfhelp.service';
import { LlmFormSubmitResponse } from '../selfhelpInterfaces';

/**
 * LLM Form Service
 *
 * Handles the backend contract for `llmFormRecord` / `llmFormLog` styles
 * provided by the `sh-shp-llm` plugin (v1.1.0+).
 *
 * Four actions are supported by the backend `LlmFormController`:
 *  - Normal submit (`__llm_form=1`): saves the form then generates an LLM result.
 *  - `__llm_action=regenerate` + `__record_id`: re-generates from a saved record.
 *  - `__llm_action=retry` + `__record_id`: retries after a failed generation.
 *  - `__llm_action=generate_feedback`: runs LLM on the current form values
 *    without saving (used when `llm_manual_feedback_enabled` is on).
 *
 * All four return the same `LlmFormSubmitResponse` shape.
 */
@Injectable({
    providedIn: 'root'
})
export class LlmFormService {

    constructor(private selfhelpService: SelfhelpService) { }

    /**
     * Submit an LLM form. The backend saves the form data (same as the
     * regular formUserInput controller), then calls the LLM and returns
     * the generated result.
     *
     * @param url Page URL/keyword the form lives on.
     * @param formParams Prepared form params (from `prepareParams()`).
     * @returns Parsed JSON response.
     */
    submitLlmForm(url: string, formParams: Record<string, any>): Promise<LlmFormSubmitResponse> {
        const params = {
            ...formParams,
            __llm_form: '1'
        };
        return this.selfhelpService.execServerRequest<LlmFormSubmitResponse>(url, params);
    }

    /**
     * Regenerate the LLM result from a previously saved record. When
     * `recordId` is omitted the backend falls back to the user's most
     * recent record (ORDER BY record_id DESC).
     *
     * @param url Page URL/keyword.
     * @param recordId Optional saved record id.
     */
    regenerateLlm(url: string, recordId: string | number | null | undefined): Promise<LlmFormSubmitResponse> {
        const params: Record<string, any> = { __llm_action: 'regenerate' };
        if (recordId !== undefined && recordId !== null && recordId !== '') {
            params['__record_id'] = String(recordId);
        }
        return this.selfhelpService.execServerRequest<LlmFormSubmitResponse>(url, params);
    }

    /**
     * Retry LLM generation for a saved record after an earlier failure.
     * When `recordId` is omitted the backend falls back to the user's
     * most recent record.
     *
     * @param url Page URL/keyword.
     * @param recordId Optional saved record id.
     */
    retryLlm(url: string, recordId: string | number | null | undefined): Promise<LlmFormSubmitResponse> {
        const params: Record<string, any> = { __llm_action: 'retry' };
        if (recordId !== undefined && recordId !== null && recordId !== '') {
            params['__record_id'] = String(recordId);
        }
        return this.selfhelpService.execServerRequest<LlmFormSubmitResponse>(url, params);
    }

    /**
     * Generate LLM feedback from the current form values without saving
     * (manual feedback mode). Intended for the "Generate Feedback" button
     * that only appears when `llm_manual_feedback_enabled === '1'`.
     *
     * @param url Page URL/keyword.
     * @param formParams Prepared form params (from `prepareParams()`).
     */
    generateManualFeedback(url: string, formParams: Record<string, any>): Promise<LlmFormSubmitResponse> {
        const params = {
            ...formParams,
            __llm_action: 'generate_feedback'
        };
        return this.selfhelpService.execServerRequest<LlmFormSubmitResponse>(url, params);
    }
}
