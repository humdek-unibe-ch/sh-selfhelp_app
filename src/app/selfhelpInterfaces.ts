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

export interface VideoContent {
    source: string,
    type: string,
}

export interface StyleField {
    content: string | ValueItem | VideoContent[],
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
    items: StyleField,
    is_multiple: StyleField,
    max: StyleField,
    live_search: StyleField,
    disabled: StyleField,
    alt: StyleField
}

export interface TextAreaStyle extends FormField {
    placeholder: StyleField
}

export interface QualtricsSurveyStyle extends Style {
    qualtricsSurvey: StyleField,
    qualtrics_url: string
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

export type Styles = (CardStyle | ContainerStyle | MarkdownStyle | ConditionalContainerStyle | FormUserInputStyle)[];

export interface SelfHelpPageRequest {
    navigation: SelfHelpNavigation[],
    content: Styles,
    logged_in: boolean,
    time?: any
}

export interface Url {
    [key: string]: Styles
}

export interface SelfHelp {
    navigation: SelfHelpNavigation[],
    selectedMenu: SelfHelpNavigation,
    selectedSubMenu: SelfHelpNavigation,
    urls: Url,
    logged_in: boolean
}