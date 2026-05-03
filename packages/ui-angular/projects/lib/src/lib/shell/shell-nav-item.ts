export interface XShellNavItem {
    label: string
    to: string
    /** Inline SVG markup; renders as an icon next to the label. */
    icon?: string
    /** Visually-hidden a11y description for the icon-only collapsed state. */
    ariaLabel?: string
}

export interface XShellBrand {
    name: string
    logoUrl?: string
}

export interface XShellUser {
    name?: string | null
    email?: string | null
    initials?: string | null
}
