import { __ } from '@wordpress/i18n';

export const STATUS_LABEL = {
    draft:     __( 'Draft', 'gratora-fundraising-campaigns' ),
    published: __( 'Active', 'gratora-fundraising-campaigns' ),
    archived:  __( 'Archived', 'gratora-fundraising-campaigns' ),
};

export const STATUS_COLORS = {
    draft:     { bg: '#fff4d6', fg: '#856a1d' },
    published: { bg: '#dff5e1', fg: '#205c2d' },
    archived:  { bg: '#e0e0e0', fg: '#444' },
};

/**
 * Status pill. Known statuses (draft/published/archived) carry their own
 * label + colour; anything else renders neutral with the raw status as label.
 */
export default function StatusBadge( { status } ) {
    const c = STATUS_COLORS[ status ] || { bg: '#eee', fg: '#444' };
    const label = STATUS_LABEL[ status ] || status;
    return (
        <span
            style={ {
                background:    c.bg,
                color:         c.fg,
                padding:       '2px 10px',
                borderRadius:  '12px',
                fontSize:      '11px',
                fontWeight:    500,
                letterSpacing: '.02em',
                whiteSpace:    'nowrap',
            } }
        >
            { label }
        </span>
    );
}
