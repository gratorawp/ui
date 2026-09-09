/**
 * Centralised icon adapter over lucide-react. Add icons here so tree-shaking
 * stays effective. Default strokeWidth is 1.75.
 */

import {
    Activity,
    AlertTriangle,
    AlignJustify,
    ArrowDown,
    ArrowUp,
    Building2,
    Calendar,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    CircleDollarSign,
    Clock,
    Coins,
    Copy,
    CreditCard,
    Download,
    ExternalLink,
    Eye,
    EyeOff,
    File,
    Globe,
    GripVertical,
    Heart,
    Image as ImageIcon,
    Info,
    Key,
    LayoutGrid,
    Link as LinkIcon,
    Lock,
    Mail,
    MapPin,
    Minus,
    Monitor,
    MoreHorizontal,
    MoreVertical,
    PanelRight,
    Pencil,
    Phone,
    Plus,
    Receipt,
    Redo2,
    RefreshCw,
    Reply,
    RotateCcw,
    Search,
    Settings,
    Shield,
    ShieldCheck,
    SlidersHorizontal,
    Smartphone,
    StickyNote,
    Tablet,
    Target,
    Trash2,
    Undo2,
    Users,
    X,
} from 'lucide-react';

const ICONS = {
    // Status / state
    'check':         Check,
    'check-small':   Check,
    'plus':          Plus,
    'minus':         Minus,
    'close':         X,
    'dot':           CircleFilled,
    'dot-small':     CircleFilled,

    // Chevrons / arrows
    'chevron-up':    ChevronUp,
    'chevron-down':  ChevronDown,
    'chevron-left':  ChevronLeft,
    'chevron-right': ChevronRight,
    'arrow-up':      ArrowUp,
    'arrow-down':    ArrowDown,
    'caret-down':    ChevronDown,

    // Actions / objects
    'copy':          Copy,
    'trash':         Trash2,
    'edit':          Pencil,
    'search':        Search,
    'more':          MoreHorizontal,
    'more-vertical': MoreVertical,
    'download':      Download,
    'refresh':       RefreshCw,
    'refund':        RotateCcw,
    'reply':         Reply,
    'external-link': ExternalLink,
    'drag-grip':     GripVertical,

    // Contact / location
    'mail':          Mail,
    'phone':         Phone,
    'map-pin':       MapPin,
    'note':          StickyNote,
    'link':          LinkIcon,

    // Status / security
    'alert':         AlertTriangle,
    'info':          Info,
    'shield':        Shield,
    'shield-check':  ShieldCheck,
    'lock':          Lock,
    'key':           Key,
    'eye':           Eye,
    'eye-off':       EyeOff,

    // Time
    'calendar':      Calendar,
    'clock':         Clock,

    // Files / media
    'file':          File,
    'receipt':       Receipt,
    'image':         ImageIcon,

    // Settings / config
    'settings':      Settings,
    'sliders':       SlidersHorizontal,
    'globe':         Globe,
    'layout-grid':   LayoutGrid,

    // Entities / metrics
    'building':      Building2,
    'users':         Users,
    'heart':         Heart,
    'coin':          Coins,
    'activity':      Activity,
    'currency':      CircleDollarSign,
    'credit-card':   CreditCard,

    // Devices
    'desktop':       Monitor,
    'tablet':        Tablet,
    'mobile':        Smartphone,
    'list-view':     AlignJustify,
    'panel-right':   PanelRight,
    'undo':          Undo2,
    'redo':          Redo2,

    // Misc
    'target':        Target,
};

// Lucide Circle is stroke-only; Dot is a tiny centred dot. Neither suits
// the solid status-dot semantic, so we render our own.
function CircleFilled( { size = 16, className, ...rest } ) {
    return (
        <svg
            width={ size }
            height={ size }
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden={ rest[ 'aria-label' ] ? undefined : 'true' }
            role={ rest[ 'aria-label' ] ? 'img' : undefined }
            focusable="false"
            className={ className }
            { ...rest }
        >
            <circle cx="12" cy="12" r="6" />
        </svg>
    );
}

export default function Icon( { name, size = 16, strokeWidth = 1.75, className, ...rest } ) {
    const LucideIcon = ICONS[ name ];
    if ( ! LucideIcon ) {
        if ( typeof console !== 'undefined' ) {
            console.warn( `[Gratora] Unknown icon: ${ name }` );
        }
        return null;
    }

    return (
        <LucideIcon
            size={ size }
            strokeWidth={ strokeWidth }
            className={ className }
            { ...rest }
        />
    );
}

export { ICONS };
