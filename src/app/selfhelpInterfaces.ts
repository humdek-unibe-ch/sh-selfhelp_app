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

export interface ConfirmAlert {
    header?: string,
    msg: string,
    confirmLabel?: string,
    cancelLabel?: string,
    backdropDismiss?: boolean,
    callback?: () => void
}

export type Styles = (CardStyle | ContainerStyle | MarkdownStyle | ConditionalContainerStyle | FormUserInputStyle)[];

export interface SelfHelpPageRequest {
    navigation: SelfHelpNavigation[],
    content: Styles,
    logged_in: boolean,
    time?: any,
    base_path: string
}

export interface Url {
    [key: string]: Styles
}

export interface SelfHelp {
    navigation: SelfHelpNavigation[],
    selectedMenu: SelfHelpNavigation,
    selectedSubMenu: SelfHelpNavigation,
    urls: Url,
    logged_in: boolean,
    base_path: string
}