import { CapacitorConfig } from "@capacitor/cli";

export type LocalSelfhelp = 'selfhelp';
export type SkinApp = 'ios' | 'md';
export type ModalCloseType = 'submit' | 'cancel';
export type OSShortcuts = 'general_settings' | 'screen_time';
export type MobilePlatform = 'ios' | 'android';

export interface TabMenuItem {
    keyword: string;
    title: string;
    url: string;
}

export interface SelfHelpNavigation {
    id_navigation_section: any,
    title: string,
    keyword: string,
    url: string,
    icon: string,
    is_active: boolean,
    children: SelfHelpNavigation[]
}

export interface StyleId {
    content: number,
    type: string
}

export interface ValueItem {
    value: string,
    text: string,
}

export interface MediaContent {
    source: string,
    type: string,
}

export interface CarouselContent {
    source: string,
    alt: string,
    caption: string
}

export interface StyleField {
    content: string | ValueItem | MediaContent[] | CarouselContent[] | any,
    type: string,
    id: number,
    default: string
}

export interface Style {
    id: StyleId,
    style_name: string,
    children: any,
    css: string,
    success_msgs?: string[],
    fail_msgs?: string[],
    css_mobile?: StyleField,
    [key: string]: any; // Index signature for dynamic property access
}

export interface DivStyle extends Style {
    color_background: StyleField,
    color_border: StyleField,
    color_text: StyleField,
    custom_style: string
}

export interface CardStyle extends Style {
    title: StyleField,
    children: any
}

export interface ModalStyle extends Style {
    title: StyleField,
    children: any
}

export interface ContainerStyle extends Style {
    is_fluid: StyleField,
    export_pdf: StyleField,
}

export interface MarkdownStyle extends Style {
    text_md: StyleField
}

export interface ConditionalContainerStyle extends Style {
    content: StyleField,
    debug: StyleField,
}

export interface FormUserInputStyle extends Style {
    name: StyleField,
    type: StyleField,
    is_log: StyleField,
    ajax: StyleField,
    label: StyleField,
    alert_success: StyleField,
    submit_and_send_email: StyleField,
    submit_and_send_label: StyleField,
    close_modal_at_end: StyleField,
    redirect_at_end: StyleField,
    confirmation_title: StyleField,
    label_cancel: StyleField,
    confirmation_continue: StyleField,
    confirmation_message: StyleField,
    url_cancel: StyleField,
}

export interface FormField extends Style {
    is_required: StyleField,
    name: StyleField,
    label: StyleField,
    value: StyleField,
    last_value?: string
}

export interface InputStyle extends FormField {
    type_input: StyleField,
    placeholder: StyleField,
    format?: string
}

export interface CheckboxStyle extends FormField {
    checkbox_value: StyleField
}

export interface RadioStyle extends FormField {
    items: StyleField
}

export interface SelectItem {
    value: any;
    text: string;
}

export interface SelectStyle extends FormField {
    items: SelectItem[],
    is_multiple: StyleField,
    max: StyleField,
    live_search: StyleField,
    disabled: StyleField,
    alt: StyleField,
    image_selector: StyleField
}

export interface TextAreaStyle extends FormField {
    placeholder: StyleField
}

export interface QualtricsSurveyStyle extends Style {
    qualtricsSurvey: StyleField,
    qualtrics_url: string,
    alert: string,
    show_survey: boolean,
    restart_on_refresh: StyleField,
    use_as_container: StyleField,
    close_modal_at_end: StyleField,
    time: Date,
    redirect_at_end: StyleField
}

export interface ImageStyle extends Style {
    is_fluid: StyleField,
    title: StyleField,
    alt: StyleField,
    img_src: StyleField,
    width: StyleField,
    height: StyleField
}

export interface VideoStyle extends Style {
    is_fluid: StyleField,
    alt: StyleField,
    sources: StyleField
}

export interface AlertStyle extends Style {
    is_dismissable: StyleField,
    type: StyleField
}

export interface PlaintextStyle extends Style {
    is_paragraph: StyleField,
    text: StyleField
}

export interface MarkdownInlineStyle extends Style {
    text_md_inline: StyleField
}

export interface HeadingStyle extends Style {
    level: StyleField,
    title: StyleField
}

export interface RawTextStyle extends Style {
    text: StyleField
}

export interface AudioStyle extends Style {
    alt: StyleField,
    sources: StyleField
}

export interface FigureStyle extends Style {
    caption_title: StyleField,
    caption: StyleField
}

export interface ProgressBarStyle extends Style {
    type: StyleField,
    count: StyleField,
    count_max: StyleField,
    is_striped: StyleField,
    has_label: StyleField
}

export interface CarouselStyle extends Style {
    id_prefix: StyleField,
    has_controls: StyleField,
    has_indicators: StyleField,
    has_crossfade: StyleField,
    sources: StyleField
}

export interface TabStyle extends Style {
    label: StyleField,
    type: StyleField,
    is_expanded: StyleField,
    icon: StyleField
}

export interface GraphStyle extends Style {
    title: StyleField,
    traces: StyleField,
    layout: StyleField,
    show_graph: boolean
}

export interface ShowUserInputStyle extends Style {
    fields: any,
    is_log: StyleField,
    delete_title: StyleField,
    label_delete: StyleField,
    delete_content: StyleField,
    source: StyleField,
    label_date_time: StyleField,
    can_delete: boolean,
}

export interface ButtonStyle extends Style {
    url: StyleField,
    type: StyleField,
    label: StyleField,
    label_cancel: StyleField,
    confirmation_continue: StyleField,
    confirmation_message: StyleField,
    confirmation_title: StyleField,
}

export interface ShortcutButtonStyle extends Style {
    shortcut_ios: StyleField,
    shortcut_android: StyleField,
    type: StyleField,
    label: StyleField
}

export interface OpenAppButtonStyle extends Style {
    installation_ios_url: StyleField,
    installation_android_url: StyleField,
    app_url_android: StyleField,
    app_url_ios: StyleField,
    type: StyleField,
    label: StyleField
}

export interface LinkStyle extends Style {
    url: StyleField,
    open_in_new_tab: StyleField,
    label: StyleField
}

export interface AccordionListStyle extends Style {
    id_active: StyleField,
    title_prefix: StyleField,
    label_root: StyleField,
    id_prefix: StyleField,
    items: StyleField
}

export interface NestedListStyle extends Style {
    is_expanded: StyleField,
    is_collapsible: StyleField,
    id_prefix: StyleField,
    id_active: StyleField,
    title_prefix: StyleField,
    items: StyleField,
}

export interface SortableListStyle extends Style {
    is_sortable: StyleField,
    is_editable: StyleField,
    url_delete: StyleField,
    url_add: StyleField,
    items: StyleField,
}

export interface NavigationContainerStyle extends Style {
    text_md: StyleField,
    title: StyleField
}

export interface JsonStyle extends Style {
    json: StyleField
}

export interface QuizStyle extends Style {
    type: StyleField,
    caption: StyleField,
    label_right: StyleField,
    label_wrong: StyleField,
    right_content: StyleField,
    wrong_content: StyleField,
}

export interface LoginStyle extends Style {
    type: StyleField,
    label: StyleField,
    label_user: StyleField,
    label_pw: StyleField,
    label_login: StyleField,
    label_pw_reset: StyleField,
    alert_fail: StyleField,
    login_title: StyleField,
    anonymous_users: Boolean,
    is_reset_password_enabled: Boolean
}

export interface RegisterStyle extends Style {
    type: StyleField,
    open_registration: StyleField,
    group: StyleField,
    label_user: StyleField,
    label_pw: StyleField,
    alert_fail: StyleField,
    title: StyleField,
    alert_success: StyleField,
    success: StyleField,
    label_submit: StyleField,
    anonymous_users: Boolean,
    security_questions: ValueItem[]
}

export interface ProfileStyle extends Style {
    label: StyleField,
    alert_fail: StyleField,
    alert_del_fail: StyleField,
    alert_del_success: StyleField,
    alert_success: StyleField,
    profile_title: string
}

export interface ResetPasswordStyle extends Style {
    type: StyleField,
    is_html: StyleField,
    label_login: StyleField,
    label_pw_reset: StyleField,
    alert_fail: StyleField,
    text_md: StyleField,
    alert_success: StyleField,
    success: StyleField,
    placeholder: StyleField,
    anonymous_users: Boolean,
    is_reset_password_enabled: Boolean,
    security_questions_labels: SecurityQuestion[]
    reset_user_name: string
}

export interface ValidateStyle extends Style {
    label: StyleField,
    label_pw: StyleField,
    label_login: StyleField,
    alert_fail: StyleField,
    label_pw_confirm: StyleField,
    title: StyleField,
    subtitle: StyleField,
    alert_success: StyleField,
    label_name: StyleField,
    name_placeholder: StyleField,
    name_description: StyleField,
    label_gender: StyleField,
    gender_male: StyleField,
    gender_female: StyleField,
    gender_divers: StyleField,
    label_activate: StyleField,
    pw_placeholder: StyleField,
    success: StyleField,
    anonymous_users: Boolean,
    user_name: String,
    css_gender: String
}

export interface TwoFactorAuthStyle extends Style {
    label_expiration_2fa: StyleField,
    alert_fail: StyleField,
    label: StyleField,
    text_md: StyleField
}

export interface MessageBoardStyle extends Style {
    comments: StyleField,
    form_name: StyleField,
    icons: StyleField,
    is_log: StyleField,
    label: StyleField,
    max: StyleField,
    messages: MessageBoardMessage[],
    name: StyleField,
    text_md: StyleField,
    title: StyleField,
    type_input: StyleField,
    id_section: number,
    id_reply: number,
    id_link: number
}

export interface EntryListStyle extends Style {
    formName?: StyleField,
    load_as_table?: StyleField,
}

export interface CalendarStyle extends Style {
    title: StyleField,
    label_month: StyleField,
    label_week: StyleField,
    label_day: StyleField,
    config: StyleField,
}

export interface CalendarsStyle extends CalendarStyle {
    label_calendar: StyleField,
    label_card_title_calendars: StyleField,
    label_delete_calendar: StyleField,
    label_edit_calendar: StyleField,
    name: StyleField,
    calendars: any
}

export interface SbAsterChart extends Style {
    label_started: StyleField,
    label_finished: StyleField,
    data: any
}

export interface SurveyJSStyle extends Style {
    alert: string,
    restart_on_refresh: StyleField,
    close_modal_at_end: StyleField,
    redirect_at_end: StyleField,
    save_pdf: StyleField,
    survey_js_theme: StyleField,
    show_survey: boolean,
    survey_json: any, // survey_js json structure
    survey_generated_id: string,
    last_response: any, // the last user response if the survey is not yet finished and should be continued
}

export interface LabJSStyle extends Style {
    lab_json: any,
    redirect_at_end: StyleField,
    close_modal_at_end: StyleField,
    labjs_generated_id: string,
}

export interface HTMLTagStyle extends Style {
    html_tag: StyleField;
}

export interface ShepherdJSStyle extends Style {
    options: StyleField;
    steps: StyleField;
    show_once: StyleField;
    use_javascript: StyleField;
    state: any;
    page_keyword: string;
    last_url: string;
}

export interface EntryRecordDeleteStyle extends Style {
    label_delete: StyleField;
    confirmation_title: StyleField;
    confirmation_continue: StyleField;
    confirmation_message: StyleField;
    type: StyleField;
    redirect_at_end: StyleField;
    delete_record_id: number;
}

export interface ShepherdState {
    step_index: number;
    tourName: string;
    trigger_type: "started" | "updated" | "finished";
    record_id?: number;
}

export interface MessageBoardMessage {
    color: string,
    icon_counter: any,
    record_id: number,
    reply_messages: MessageBoardMessageReply[],
    score: string,
    time: string,
    ts: Date,
    user: string,
    avatar: string,
    url: string
}

export interface MessageBoardMessageReply {
    create_time: Date,
    user_id: number,
    user_name: string,
    avatar: string,
    value: string,
    time: string
}

export interface ConfirmAlert {
    header?: string,
    msg: string,
    confirmLabel?: string,
    cancelLabel?: string,
    backdropDismiss?: boolean,
    callback?: () => void
}

export interface LoginValues {
    email: string,
    password: string,
    type?: string,
}

export interface RegistrationValues {
    email: string,
    code?: string,
    type?: string,
}

export interface ValidateValues {
    name: string,
    pw: string,
    pw_verify: string,
    gender: number
}

export interface ResetPasswordValues {
    email_user: string
}

export type Styles = (CardStyle | ContainerStyle | MarkdownStyle | ConditionalContainerStyle | FormUserInputStyle | ProfileStyle)[];

export interface SelfHelpPageRequest {
    navigation: SelfHelpNavigation[],
    content: Styles,
    logged_in: boolean,
    is_headless: boolean,
    time?: any,
    base_path: string,
    title: string,
    avatar: string,
    external_css: string,
    languages: Language[],
    user_language: Number,
    redirect_url: string | Boolean,
    two_factor_auth: boolean,
}

export interface SecurityQuestion {
    id: string,
    text: string,
}

export interface CachedPage {
    content: Styles,
    title: string,
}

export interface Language {
    id: Number,
    locale: string,
    title: string,
}

export interface RegistrationResult {
    result: Boolean,
    url: string | Boolean,
}

export interface ValidationResult {
    result: Boolean,
    url: string | Boolean,
}

export interface ResetPasswordResult {
    result: Boolean,
    url: string | Boolean,
    selfhelp_res: SelfHelpPageRequest,
}

export interface Url {
    [key: string]: CachedPage
}

export interface SelfHelp {
    navigation: SelfHelpNavigation[],
    selectedMenu?: SelfHelpNavigation,
    selectedSubMenu?: SelfHelpNavigation,
    urls: Url,
    logged_in?: boolean,
    base_path: string,
    current_url: string,
    current_modal_url: string,
    credentials?: LoginValues,
    avatar: string,
    external_css: string,
    is_headless: boolean,
    languages?: Language[],
    locale?: string,
    user_language: Number | null,
    two_factor_auth?: boolean,
}
export interface AppConfig {
    capacitorConfig: CapacitorConfig,
    server: string,
    defaultAppLocale?: string,
    devApp?: boolean,
    messageDuration?: number
}

export interface SurveyJSMetaData {
    user_agent: string;
    screen_width: number;
    screen_height: number;
    pixel_ratio: number;
    viewport_width: number;
    viewport_height: number;
    start_time: Date;
    pages: SurveyJSMetaDataPage[];
}

export interface SurveyJSMetaDataPage {
    pageNo: number;
    start_time: Date;
    end_time?: Date;
    duration?: number;
}

export interface TwoFactorAuthResult {
    message?: string,
    success?: boolean
}

// ============================================================================
// LLM CHAT TYPES
// ============================================================================

export interface LlmChatStyle extends Style {
    // Configuration fields
    llm_max_tokens: StyleField;
    llm_temperature: StyleField;
    conversation_limit: StyleField;
    message_limit: StyleField;
    llm_model: StyleField;
    enable_conversations_list: StyleField;
    enable_file_uploads: StyleField;
    enable_full_page_reload: StyleField;
    enable_form_mode: StyleField;
    enable_data_saving: StyleField;
    data_table_name: StyleField;
    enable_media_rendering: StyleField;
    allowed_media_domains: StyleField;
    enable_floating_button: StyleField;
    floating_button_position: StyleField;
    floating_button_icon: StyleField;
    floating_button_label: StyleField;
    floating_chat_title: StyleField;
    enable_progress_tracking: StyleField;
    progress_bar_label: StyleField;
    progress_complete_message: StyleField;
    progress_show_topics: StyleField;
    enable_danger_detection: StyleField;
    danger_keywords: StyleField;
    danger_notification_emails: StyleField;
    danger_blocked_message: StyleField;
    auto_start_conversation: StyleField;
    auto_start_message: StyleField;
    strict_conversation_mode: StyleField;
    conversation_context: StyleField;
    // UI Labels
    submit_button_label: StyleField;
    new_chat_button_label: StyleField;
    delete_chat_button_label: StyleField;
    chat_description: StyleField;
    conversations_heading: StyleField;
    no_conversations_message: StyleField;
    select_conversation_heading: StyleField;
    select_conversation_description: StyleField;
    model_label_prefix: StyleField;
    no_messages_message: StyleField;
    tokens_used_suffix: StyleField;
    loading_text: StyleField;
    ai_thinking_text: StyleField;
    upload_image_label: StyleField;
    upload_help_text: StyleField;
    message_placeholder: StyleField;
    clear_button_label: StyleField;
    new_conversation_title_label: StyleField;
    conversation_title_label: StyleField;
    conversation_name: StyleField;
    cancel_button_label: StyleField;
    create_button_label: StyleField;
    delete_confirmation_title: StyleField;
    delete_confirmation_message: StyleField;
    confirm_delete_button_label: StyleField;
    cancel_delete_button_label: StyleField;
    empty_message_error: StyleField;
    default_chat_title: StyleField;
    delete_button_title: StyleField;
    conversation_title_placeholder: StyleField;
    single_file_attached_text: StyleField;
    multiple_files_attached_text: StyleField;
    empty_state_title: StyleField;
    empty_state_description: StyleField;
    loading_messages_text: StyleField;
    attach_files_title: StyleField;
    no_vision_support_title: StyleField;
    no_vision_support_text: StyleField;
    send_message_title: StyleField;
    remove_file_title: StyleField;
    form_mode_active_title: StyleField;
    form_mode_active_description: StyleField;
    continue_button_label: StyleField;
    // Runtime data
    user_id: string;
    section_id: number;
    conversations: LlmConversation[];
    messages: LlmMessage[];
    current_conversation: LlmConversation;
}

/**
 * LLM Chat Conversation
 */
export interface LlmConversation {
    id: string;
    id_sections?: string;
    user_id?: number;
    title: string;
    model: string;
    temperature?: number;
    max_tokens?: number;
    created_at: string;
    updated_at: string;
    blocked?: boolean | number;
    blocked_reason?: string | null;
    blocked_at?: string | null;
}

/**
 * LLM Chat Message
 */
export interface LlmMessage {
    id: string;
    conversation_id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    formatted_content?: string;
    timestamp: string;
    tokens_used?: number;
    attachments?: string;
    model?: string;
}

/**
 * LLM Chat API Response types
 */
export interface LlmGetConversationsResponse {
    conversations?: LlmConversation[];
    error?: string;
}

export interface LlmGetConversationResponse {
    conversation?: LlmConversation;
    messages?: LlmMessage[];
    error?: string;
}

export interface LlmSendMessageResponse {
    conversation_id?: string;
    message?: string;
    is_new_conversation?: boolean;
    error?: string;
    blocked?: boolean;
    type?: 'danger_detected' | 'conversation_blocked';
}

export interface LlmNewConversationResponse {
    conversation_id?: string;
    error?: string;
}

export interface LlmDeleteConversationResponse {
    success?: boolean;
    error?: string;
}

/**
 * LLM Chat Selected File (for file uploads)
 */
export interface LlmSelectedFile {
    id: string;
    file: File;
    hash: string;
    previewUrl?: string;
}

/**
 * LLM Chat File Config
 */
export interface LlmFileConfig {
    maxFileSize: number;
    maxFilesPerMessage: number;
    allowedImageExtensions: string[];
    allowedDocumentExtensions: string[];
    allowedCodeExtensions: string[];
    allowedExtensions: string[];
    visionModels: string[];
}

/**
 * LLM Chat Progress Data
 */
export interface LlmProgressData {
    percentage: number;
    topics_total: number;
    topics_covered: number;
    topic_coverage: Record<string, LlmTopicCoverage>;
    is_complete: boolean;
}

export interface LlmTopicCoverage {
    id: string;
    title: string;
    coverage: number;
    weight: number;
    is_covered: boolean;
}

/**
 * LLM Chat Form Field
 */
export interface LlmFormField {
    id: string;
    type: 'radio' | 'checkbox' | 'select' | 'text' | 'textarea' | 'number' | 'scale' | 'hidden';
    label: string;
    required?: boolean;
    options?: LlmFormFieldOption[];
    helpText?: string;
    placeholder?: string;
    maxLength?: number;
    rows?: number;
    min?: number;
    max?: number;
    step?: number;
    value?: string;
}

export interface LlmFormFieldOption {
    value: string;
    label: string;
}

/**
 * LLM Chat Form Definition
 */
export interface LlmFormDefinition {
    type: 'form';
    title?: string;
    description?: string;
    fields: LlmFormField[];
    submitLabel?: string;
    contentBefore?: string;
    contentAfter?: string;
}

/**
 * LLM Chat Structured Response
 */
export interface LlmStructuredResponse {
    content: {
        text_blocks: LlmTextBlock[];
        forms?: LlmStructuredForm[];
        media?: LlmMediaItem[];
        next_step?: LlmNextStep;
    };
    meta: {
        response_type: string;
        progress?: LlmStructuredProgress;
        emotion?: string;
    };
}

export interface LlmTextBlock {
    type: 'paragraph' | 'heading' | 'list' | 'quote' | 'info' | 'warning' | 'success' | 'tip';
    content: string;
    level?: number;
}

export interface LlmStructuredForm {
    id: string;
    title?: string;
    description?: string;
    optional?: boolean;
    fields: LlmFormField[];
    submit_label?: string;
}

export interface LlmMediaItem {
    type: 'image' | 'video' | 'audio';
    src: string;
    alt?: string;
    caption?: string;
}

export interface LlmNextStep {
    prompt?: string;
    suggestions?: string[];
    can_skip?: boolean;
}

export interface LlmStructuredProgress {
    percentage: number;
    covered_topics?: string[];
    newly_covered?: string[];
    remaining_topics?: number;
    milestone?: string | null;
}

/**
 * Extended Send Message Response with progress and structured data
 */
export interface LlmSendMessageResponseExtended extends LlmSendMessageResponse {
    progress?: LlmProgressData;
    structured?: LlmStructuredResponse;
    safety?: {
        is_safe: boolean;
        danger_level: null | 'warning' | 'critical' | 'emergency';
        detected_concerns: string[];
        requires_intervention: boolean;
        safety_message?: string | null;
    };
    detected_keywords?: string[];
}

/**
 * LLM Form Submission Response
 */
export interface LlmFormSubmissionResponse extends LlmSendMessageResponseExtended {
    conversation_id?: string;
    message?: string;
    is_new_conversation?: boolean;
    progress?: LlmProgressData;
    structured?: LlmStructuredResponse;
    error?: string;
}

/**
 * LLM Progress Response
 */
export interface LlmGetProgressResponse {
    progress?: LlmProgressData;
    error?: string;
}