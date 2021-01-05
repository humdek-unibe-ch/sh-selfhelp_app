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

export interface StyleField {
    content: string,
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

export interface InputStyle extends Style {
    type_input: StyleField,
    is_required: StyleField,
    name: StyleField,
    label: StyleField,
    value: StyleField,
    placeholder: StyleField,
    last_value?: string
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