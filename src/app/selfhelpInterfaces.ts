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
    name: string,
    type: "style",
    children: any,
    css: string
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

export type Styles = (CardStyle | ContainerStyle | MarkdownStyle)[];

export interface SelfHelpPageRequest {
    navigation: SelfHelpNavigation[],
    content: Styles,
    time?: any    
}

// export interface SelfHelp {
//     page: SelfHelpPage,
//     selected_menu_title?: string
// }

export interface Url {
    [key:string]: Styles
}

export interface SelfHelp{
    navigation: SelfHelpNavigation[],
    selectedMenu: SelfHelpNavigation,
    selectedSubMenu: SelfHelpNavigation,
    urls: Url
}