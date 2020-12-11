export interface TabMenuItem {
    keyword: string;
    title: string;
}

export interface SelfHelpNavigation {
    id_navigation_section: any,
    title: string,
    keyword: string,
    is_active: boolean,
    children: any
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
    name: string,
    type: "style"
    children: any
}

export interface CardStyle extends Style {
    title: StyleField,
    name: string,
    type: "style"
    childrn: any
}

export interface ContainerStyle extends Style {
    is_fluid: StyleField,
    export_pdf: StyleField,
}

export interface MarkdownStyle extends Style {
    text_md: StyleField
}

export type Styles = (CardStyle | ContainerStyle | MarkdownStyle)[];

export interface SelfHelpPage {
    navigation: SelfHelpNavigation[],
    content: Styles
}