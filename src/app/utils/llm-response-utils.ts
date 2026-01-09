import {
    LlmStructuredResponse,
    LlmTextBlock,
    LlmStructuredForm,
    LlmMediaItem,
    LlmNextStep,
    LlmFormField,
    LlmFormDefinition
} from '../selfhelpInterfaces';

/**
 * LLM Response Parsing Utilities
 * ==============================
 *
 * Utility functions for parsing and handling LLM structured responses.
 * These functions handle the conversion between different response formats
 * and provide validation and transformation capabilities.
 *
 * @module utils/llm-response-utils
 */

/**
 * Check if content is a valid LLM structured response
 * Supports both old schema (with meta) and new unified schema (type: "response")
 */
export function isLlmStructuredResponse(content: unknown): content is LlmStructuredResponse {
    if (!content || typeof content !== 'object') return false;

    const obj = content as Record<string, unknown>;

    // Must have content object
    if (!obj['content'] || typeof obj['content'] !== 'object') return false;

    const contentObj = obj['content'] as Record<string, unknown>;

    // Content must have text_blocks array
    if (!Array.isArray(contentObj['text_blocks'])) return false;

    // Check for NEW unified schema (type: "response" with safety or metadata)
    if (obj['type'] === 'response') {
        if (obj['metadata'] && typeof obj['metadata'] === 'object') return true;
        if (obj['safety'] && typeof obj['safety'] === 'object') return true;
    }

    // Check for OLD schema (meta.response_type)
    if (obj['meta'] && typeof obj['meta'] === 'object') {
        const metaObj = obj['meta'] as Record<string, unknown>;
        if (typeof metaObj['response_type'] === 'string') return true;
    }

    return false;
}

/**
 * Map text block type from new schema to old schema
 */
function mapTextBlockType(type: string): LlmTextBlock['type'] {
    const typeMap: Record<string, LlmTextBlock['type']> = {
        'text': 'paragraph',
        'heading': 'heading',
        'info': 'info',
        'warning': 'warning',
        'error': 'warning',
        'success': 'success',
        'code': 'quote',
        'paragraph': 'paragraph',
        'list': 'list',
        'quote': 'quote',
        'tip': 'tip'
    };
    return typeMap[type] || 'paragraph';
}

/**
 * Extract suggestion texts from suggestions array
 * Handles both string arrays and {text: string} object arrays
 */
function extractSuggestionTexts(suggestions: unknown[] | undefined): string[] {
    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
        return [];
    }

    return suggestions
        .map(s => {
            // Handle {text: string} objects
            if (s && typeof s === 'object' && 'text' in s) {
                const obj = s as { text: string };
                return typeof obj.text === 'string' ? obj.text : '';
            }
            // Handle direct strings
            if (typeof s === 'string') {
                return s;
            }
            return '';
        })
        .filter(Boolean);
}

/**
 * Convert unified LLM response schema to LlmStructuredResponse format
 */
function convertUnifiedToStructuredResponse(unified: Record<string, unknown>): LlmStructuredResponse {
    const content = unified['content'] as Record<string, unknown>;
    const textBlocks = content['text_blocks'] as Array<{ type: string; content: string | string[]; style?: string }>;

    // Map text blocks - handle both string and array content
    const mappedTextBlocks: LlmTextBlock[] = textBlocks.map(block => {
        // Handle list content that comes as an array
        let blockContent: string;
        if (Array.isArray(block.content)) {
            // Convert array to markdown list
            blockContent = block.content.map(item => `- ${item}`).join('\n');
        } else {
            blockContent = block.content || '';
        }

        return {
            type: mapTextBlockType(block.type || 'text'),
            content: blockContent,
            level: block.type === 'heading' ? 2 : undefined
        };
    });

    // Convert form if present
    const forms: LlmStructuredForm[] = [];
    const form = content['form'] as Record<string, unknown> | undefined;
    if (form) {
        forms.push({
            id: 'form_1',
            title: form['title'] as string | undefined,
            description: form['description'] as string | undefined,
            fields: (form['fields'] as LlmFormField[]) || [],
            submit_label: form['submit_label'] as string | undefined
        });
    }

    // Convert suggestions
    const suggestionTexts = extractSuggestionTexts(content['suggestions'] as unknown[]);

    // Extract progress from unified schema
    const progress = unified['progress'] as Record<string, unknown> | undefined;

    // Handle media conversion safely
    const mediaItems = content['media'] as Array<Record<string, unknown>> | undefined;
    const convertedMedia: LlmMediaItem[] | undefined = mediaItems?.map(m => ({
        type: m['type'] as 'image' | 'video' | 'audio',
        src: (m['url'] as string) || (m['src'] as string),
        alt: m['alt'] as string | undefined,
        caption: m['caption'] as string | undefined
    }));

    return {
        content: {
            text_blocks: mappedTextBlocks,
            forms: forms.length > 0 ? forms : undefined,
            media: convertedMedia,
            next_step: suggestionTexts.length > 0
                ? { suggestions: suggestionTexts }
                : undefined
        },
        meta: {
            response_type: 'conversational',
            emotion: 'neutral',
            progress: progress ? {
                percentage: progress['percentage'] as number,
                covered_topics: progress['topics_covered'] as string[],
                remaining_topics: (progress['topics_remaining'] as string[])?.length
            } : undefined
        }
    };
}

/**
 * Parse message content to check if it's a structured response
 * Handles both pure JSON and markdown code block wrapped JSON
 * @param content Message content to parse
 * @returns LlmStructuredResponse if valid, null otherwise
 */
export function parseLlmStructuredResponse(content: string): LlmStructuredResponse | null {
    if (!content) return null;

    let jsonContent = content.trim();

    // Remove markdown code block wrappers if present
    if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    // Check for incomplete JSON
    if (!jsonContent.startsWith('{') && !jsonContent.startsWith('[')) {
        return null;
    }

    try {
        const parsed = JSON.parse(jsonContent) as Record<string, unknown>;

        // Check if it's the new unified schema (type: "response" with content.text_blocks)
        if (parsed['type'] === 'response' && parsed['content']) {
            const contentObj = parsed['content'] as Record<string, unknown>;
            if (Array.isArray(contentObj['text_blocks']) && contentObj['text_blocks'].length > 0) {
                return convertUnifiedToStructuredResponse(parsed);
            }
        }

        // Check for old schema (meta.response_type)
        if (isLlmStructuredResponse(parsed)) {
            return parsed as LlmStructuredResponse;
        }
    } catch {
        // Not valid JSON
    }

    return null;
}

/**
 * Parse message content to check if it contains a form definition
 * @param content Message content to parse
 * @returns LlmFormDefinition if valid form, null otherwise
 */
export function parseLlmFormDefinition(content: string): LlmFormDefinition | null {
    if (!content) return null;

    let jsonContent = content.trim();

    // Remove markdown code block wrappers
    if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    if (!jsonContent.startsWith('{')) return null;

    try {
        const parsed = JSON.parse(jsonContent) as Record<string, unknown>;

        // Check if it's a form definition
        if (parsed['type'] === 'form' && Array.isArray(parsed['fields'])) {
            return parsed as unknown as LlmFormDefinition;
        }
    } catch {
        // Not valid JSON
    }

    return null;
}
