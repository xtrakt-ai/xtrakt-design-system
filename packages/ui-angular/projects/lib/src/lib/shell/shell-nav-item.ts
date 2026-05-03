export interface XShellNavItem {
    label: string
    /** Route the item navigates to. Optional for parent nodes that only group children — when
     *  omitted (or set to ''), clicking the item just toggles expansion. */
    to?: string
    /** Inline SVG markup; renders as an icon next to the label. */
    icon?: string
    /** Visually-hidden a11y description for the icon-only collapsed state. */
    ariaLabel?: string
    /** Optional nested items. When present, the item renders as an expandable group with a
     *  chevron and children indented one level. Children may themselves have `children` —
     *  the shell renders up to 3 visual levels before flattening further nesting. */
    children?: XShellNavItem[]
    /** Initial expanded state for parent nodes. Defaults to false (collapsed). The shell
     *  also auto-expands any branch whose descendant matches the current router URL. */
    expanded?: boolean
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
