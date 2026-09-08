/**
 * Live campaign-page preview with the current token map applied.
 * Tokens become inline CSS custom properties; changes are instant.
 *
 * Effective map = defaults + org-brand preset (unless layer='brand') + tokens.
 */

import { __ } from '@wordpress/i18n';
import { formatAmount, parseTimestamp } from '../utils/format';
import { derivedInk, inkPair } from './ink';

const SAMPLE_CAMPAIGN = {
    title:        'Bring clean water to 1,000 villages',
    description:  'Every donation funds a new well, reaching a family of six within a week. Together we can give whole villages safe water for the first time.',
    currency:     'USD',
    goal_cents:   5000000,
    raised_cents: 3050000,
    donors_count: 248,
    slug:         'clean-water',
    image_url:    null,
    ends_at:      null,
};

export default function StylePreview( {
    tokens   = {},
    presetId = '',
    campaign = null,
    layer    = 'campaign',
    styling  = {},
} ) {
    const frameStyle = resolveEffectiveStyle( { tokens, presetId, layer, styling } );
    const data       = campaign && campaign.id ? campaign : SAMPLE_CAMPAIGN;

    const title       = data.title       || SAMPLE_CAMPAIGN.title;
    const description = data.description || SAMPLE_CAMPAIGN.description;
    const currency    = data.currency    || SAMPLE_CAMPAIGN.currency;
    const goalCents   = Number( data.goal_cents )   || 0;
    const raisedCents = Number( data.raised_cents ) || 0;
    const donors      = Number( data.donors_count ) || 0;
    const imageUrl    = data.image_url || null;
    const slug        = data.slug      || SAMPLE_CAMPAIGN.slug;
    const endsAt      = data.ends_at   || null;

    const pct = goalCents > 0
        ? Math.min( 100, Math.round( ( raisedCents / goalCents ) * 100 ) )
        : 0;

    const presets     = derivePresets( goalCents );
    const selectedIdx = 1;

    const host = ( typeof window !== 'undefined' && window.location?.host ) || 'example.com';
    const addr = `${ host }/campaigns/${ slug }`;

    return (
        <div className="fundkit-style-preview">
            <div className="fundkit-style-preview__frame" style={ frameStyle }>
                <div className="fundkit-style-preview__chrome">
                    <span className="fundkit-style-preview__dots" aria-hidden="true">
                        <span /><span /><span />
                    </span>
                    <span className="fundkit-style-preview__addr">{ addr }</span>
                </div>

                <div className="fundkit-style-preview__page">
                    <div
                        className="fundkit-style-preview__hero"
                        style={ imageUrl ? { backgroundImage: `url(${ imageUrl })` } : undefined }
                    >
                        <div className="fundkit-style-preview__hero-title">{ title }</div>
                    </div>

                    <div className="fundkit-style-preview__body">
                        { description && (
                            <div className="fundkit-style-preview__desc">{ description }</div>
                        ) }

                        <div className="fundkit-style-preview__progress-track">
                            <div
                                className="fundkit-style-preview__progress-fill"
                                style={ { width: `${ pct }%` } }
                            />
                        </div>
                        <div className="fundkit-style-preview__progress-meta">
                            <span>
                                <strong>{ formatAmount( raisedCents, currency ) }</strong>
                                { ' ' }{ __( 'raised', 'fundkit-fundraising-campaigns' ) }
                            </span>
                            { goalCents > 0 && (
                                <span>
                                    { __( 'of', 'fundkit-fundraising-campaigns' ) }{ ' ' }
                                    { formatAmount( goalCents, currency ) }{ ' ' }
                                    { __( 'goal', 'fundkit-fundraising-campaigns' ) }
                                </span>
                            ) }
                        </div>

                        <div className="fundkit-style-preview__amounts">
                            { presets.map( ( a, i ) => (
                                <div
                                    key={ i }
                                    className={ `fundkit-style-preview__amount${ i === selectedIdx ? ' is-sel' : '' }` }
                                >
                                    { formatAmount( a, currency ) }
                                </div>
                            ) ) }
                        </div>

                        <div className="fundkit-style-preview__fields">
                            <div className="fundkit-style-preview__field">
                                <span className="fundkit-style-preview__field-label">
                                    { __( 'Other amount', 'fundkit-fundraising-campaigns' ) }
                                </span>
                                <div className="fundkit-style-preview__field-box fundkit-style-preview__field-box--amount is-focus">
                                    { formatAmount( presets[ selectedIdx ], currency ) }
                                </div>
                            </div>

                            <div className="fundkit-style-preview__field">
                                <span className="fundkit-style-preview__field-label">
                                    { __( 'Full name', 'fundkit-fundraising-campaigns' ) }
                                </span>
                                <div className="fundkit-style-preview__field-box">
                                    { __( 'Alex Morgan', 'fundkit-fundraising-campaigns' ) }
                                </div>
                            </div>
                        </div>

                        <div className="fundkit-style-preview__cta">
                            { __( 'Donate', 'fundkit-fundraising-campaigns' ) }{ ' ' }
                            { formatAmount( presets[ selectedIdx ], currency ) }
                        </div>

                        <div className="fundkit-style-preview__meta">
                            { donors > 0
                                ? `${ donors } ${ donors === 1 ? __( 'donor', 'fundkit-fundraising-campaigns' ) : __( 'donors', 'fundkit-fundraising-campaigns' ) }`
                                : __( 'No donors yet', 'fundkit-fundraising-campaigns' ) }
                            { endsAt && ` · ${ __( 'ends', 'fundkit-fundraising-campaigns' ) } ${ shortDate( endsAt ) }` }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * The authored cascade, which is what a control's baseline reads: it shows the
 * value the preset chose even where the resolver goes on to drop it.
 */
export function resolveEffectiveTokens( props = {} ) {
    const { defaults, presetTokens, inline } = cascade( props );

    return { ...defaults, ...presetTokens, ...inline };
}

/**
 * The map the page will paint: the authored cascade plus the derivations the
 * server applies on the way out, so the preview cannot promise a colour the
 * published page does not use.
 */
export function resolveEffectiveStyle( props = {} ) {
    const { defaults, presetTokens, inline, layers } = cascade( props );
    const tokens = { ...defaults, ...presetTokens, ...inline };

    dropStalePairs( tokens, layers, defaults );
    inkFollowsGround( tokens, presetTokens, inline, defaults );

    return { ...tokensToStyle( tokens ), ...derivedInk( tokens ) };
}

function cascade( { tokens = {}, presetId = '', layer = 'campaign', styling = {} } = {} ) {
    const defaults = styling.defaults || {};
    const safe     = tokens && typeof tokens === 'object' ? tokens : {};

    if ( layer === 'brand' ) {
        return {
            defaults,
            presetTokens: safe,
            inline:       {},
            layers:       presetLayers( safe, shippedTokens( styling, presetId ) ),
        };
    }

    const chosenId     = presetId || styling.default_id || '';
    const presetTokens = presetTokensFor( styling, chosenId );

    return {
        defaults,
        presetTokens,
        inline: safe,
        layers: [ ...presetLayers( presetTokens, shippedTokens( styling, chosenId ) ), safe ],
    };
}

/**
 * An id nothing answers to is a preset deleted while a campaign still named it.
 * The org default is the nearest thing to the look it had, and the bare
 * catalogue is a look nobody chose.
 */
function presetTokensFor( styling, id ) {
    const presets = Array.isArray( styling.presets ) ? styling.presets : [];
    const preset  = presets.find( ( p ) => p.id === id )
        || presets.find( ( p ) => p.id === ( styling.default_id || '' ) );

    return preset && preset.tokens && typeof preset.tokens === 'object' ? preset.tokens : {};
}

function shippedTokens( styling, id ) {
    const builtins = Array.isArray( styling.builtins ) ? styling.builtins : [];
    const builtin  = builtins.find( ( b ) => b.id === id );

    return builtin && builtin.tokens && typeof builtin.tokens === 'object' ? builtin.tokens : null;
}

/**
 * An edited built-in is two layers, and which of them set the accent decides
 * whether the tint beside it still belongs to that accent.
 */
function presetLayers( merged, shipped ) {
    if ( ! shipped ) return [ merged ];

    const edits = {};
    for ( const key in merged ) {
        if ( merged[ key ] !== shipped[ key ] ) edits[ key ] = merged[ key ];
    }

    return Object.keys( edits ).length ? [ shipped, edits ] : [ merged ];
}

/**
 * The selected tint and the focus ring belong to the accent they were chosen
 * beside. A later layer that repaints the accent and says nothing about them
 * leaves both to the stylesheet, which derives them from the resolved accent.
 */
function dropStalePairs( tokens, layers, defaults ) {
    const resolved = String( tokens[ 'fundkit-accent' ] || '' );

    for ( const key of [ 'fundkit-accent-soft', 'fundkit-focus-ring' ] ) {
        let accent     = String( defaults[ 'fundkit-accent' ] || '' );
        let pairedWith = null;

        for ( const layer of layers ) {
            if ( layer[ 'fundkit-accent' ] != null ) accent = String( layer[ 'fundkit-accent' ] );
            if ( layer[ key ] != null ) pairedWith = accent;
        }

        // Case-insensitive: the built-ins carry uppercase hex and the colour
        // control writes lowercase, so one colour arrives spelled two ways.
        const stale = pairedWith !== null
            ? pairedWith.toLowerCase() !== resolved.toLowerCase()
            : tokens[ key ] === defaults[ key ];

        if ( stale ) delete tokens[ key ];
    }
}

/**
 * Body and muted ink track the background the same way: the shipped values are
 * chosen against a white page, so an org that colours the ground and says
 * nothing about the ink would get near-black on whatever it picked.
 */
function inkFollowsGround( tokens, presetTokens, inline, defaults ) {
    const ground = String( tokens[ 'fundkit-bg' ] || '' );
    if ( ground === '' || ground === defaults[ 'fundkit-bg' ] ) return;

    const on = inkPair( ground );
    if ( ! on ) return;

    const slots = { 'fundkit-text': 0, 'fundkit-text-muted': 1 };
    for ( const key in slots ) {
        const chosen = presetTokens[ key ] != null || inline[ key ] != null;
        if ( ! chosen && tokens[ key ] === defaults[ key ] ) tokens[ key ] = on[ slots[ key ] ];
    }
}

function tokensToStyle( tokens ) {
    const out = {};
    for ( const key in tokens ) {
        const v = tokens[ key ];
        if ( typeof v === 'string' && v !== '' ) out[ `--${ key }` ] = v;
    }
    return out;
}

function derivePresets( goalCents ) {
    if ( ! goalCents || goalCents < 5000 ) return [ 2500, 5000, 10000, 25000 ];
    const round = ( v ) => {
        if ( v >= 50000 ) return Math.round( v / 5000 ) * 5000;
        if ( v >= 10000 ) return Math.round( v / 1000 ) * 1000;
        if ( v >= 2500 )  return Math.round( v / 500 ) * 500;
        return Math.round( v / 100 ) * 100;
    };
    return [
        round( goalCents * 0.005 ),
        round( goalCents * 0.01 ),
        round( goalCents * 0.02 ),
        round( goalCents * 0.05 ),
    ];
}

function shortDate( iso ) {
    try {
        const d = parseTimestamp( iso );
        const hasTime = String( iso ).length > 10;
        const dateOpts = { month: 'short', day: 'numeric', year: 'numeric' };
        if ( ! hasTime ) return d.toLocaleDateString( undefined, dateOpts );
        return d.toLocaleString( undefined, { ...dateOpts, hour: 'numeric', minute: '2-digit' } );
    } catch ( _ ) {
        return iso;
    }
}
