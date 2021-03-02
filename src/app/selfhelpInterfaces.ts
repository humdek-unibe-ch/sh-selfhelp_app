export type LocalSelfhelp = 'selfhelp';

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
    fail_msgs?: string[]
}

export interface CardStyle extends Style {
    title: StyleField,
    childrn: any
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

export interface RadioStyle extends FormField {
    items: StyleField
}

export interface SelectStyle extends FormField {
    items: any[],
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
    source: StyleField
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
    is_expanded: StyleField
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
    can_delete: boolean
}

export interface ButtonStyle extends Style {
    url: StyleField,
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
    login_title: StyleField
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
    label_submit: StyleField
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
    label_activate: StyleField,
    pw_placeholder: StyleField,
    success: StyleField,
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
    password: string
}

export interface RegistrationValues {
    email: string,
    code?: string
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
    time?: any,
    base_path: string,
    title: string,
    avatar: string
}

export interface CachedPage {
    content: Styles,
    title: string,
}

export interface Url {
    [key: string]: CachedPage
}

export interface SelfHelp {
    navigation: SelfHelpNavigation[],
    selectedMenu: SelfHelpNavigation,
    selectedSubMenu: SelfHelpNavigation,
    urls: Url,
    logged_in: boolean,
    base_path: string,
    current_url: string,
    current_modal_url: string,
    credentials?: LoginValues
    avatar: string
}