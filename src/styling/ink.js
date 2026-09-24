/**
 * What the org's colours measure.
 *
 * A ground the org chose cannot pick its own ink, so it is measured: the server
 * does it in PHP (Ink.php) when it renders. Anything that paints those colours
 * before the server sees them has to say the same thing, and three things do:
 * the brand panel while a colour picker is still being dragged, the live
 * preview, and the donation form inside a preview iframe, which is handed a
 * token map with the derived inks stripped out of it. The consuming plugin's
 * brandContrastAgreement.test.js keeps them all the same.
 *
 * A translucent ground is read as it lands on white, the page the shipped ink
 * is chosen for; translucent ink is read over the ground it is on.
 *
 * Import nothing here: the public donation-form bundle depends on this module.
 */

const ON_DARK  = '#ffffff';
const ON_LIGHT = '#10162a';

/** @return {[number,number,number]|null} the colour as it lands on white, or null when the value cannot be read. */
export function rgb( value ) {
    const c = rgba( value );
    return c ? over( c, [ 255, 255, 255 ] ) : null;
}

/** A colour, translucent or not, painted over an opaque one. */
function over( [ r, g, b, a ], under ) {
    return a >= 1 ? [ r, g, b ] : blend( [ r, g, b ], under, a );
}

/** @return {[number,number,number,number]|null} the channels and the alpha, or null when the value cannot be read. */
function rgba( value ) {
    const v = String( value ?? '' ).trim();

    const hex = v.match( /^#([0-9a-fA-F]{3,8})$/ );
    if ( hex ) {
        let h = hex[ 1 ];
        let a = 1;
        if ( h.length === 4 ) a = parseInt( h[ 3 ] + h[ 3 ], 16 ) / 255;
        if ( h.length === 8 ) a = parseInt( h.slice( 6, 8 ), 16 ) / 255;
        if ( h.length === 3 || h.length === 4 ) h = h[ 0 ] + h[ 0 ] + h[ 1 ] + h[ 1 ] + h[ 2 ] + h[ 2 ];
        if ( h.length < 6 ) return null;

        return [ parseInt( h.slice( 0, 2 ), 16 ), parseInt( h.slice( 2, 4 ), 16 ), parseInt( h.slice( 4, 6 ), 16 ), a ];
    }

    if ( /^hsla?\(/i.test( v ) ) return HSL.test( v ) ? fromHsl( v.slice( v.indexOf( '(' ) + 1, -1 ) ) : null;

    const fn = v.match( /^rgba?\(([^)]*)\)$/i );
    if ( fn ) {
        const parts = fn[ 1 ].split( /[\s,/]+/ ).filter( Boolean );
        if ( parts.length < 3 ) return null;
        const out = parts.slice( 0, 3 ).map( ( p ) => {
            const n = parseFloat( p );
            if ( Number.isNaN( n ) ) return null;
            return channel( p.includes( '%' ) ? n * 2.55 : n );
        } );
        const a = alpha( parts[ 3 ] );

        return out.some( ( n ) => n === null ) || a === null ? null : [ ...out, a ];
    }

    return null;
}

/** Opacity from 0 to 1, or null when the bit is not one. */
function alpha( bit ) {
    if ( bit === undefined ) return 1;
    if ( bit.toLowerCase() === 'none' ) return 0;

    const n = Number( bit.endsWith( '%' ) ? bit.slice( 0, -1 ) : bit );
    if ( bit === '' || Number.isNaN( n ) ) return null;

    return Math.max( 0, Math.min( 1, bit.endsWith( '%' ) ? n / 100 : n ) );
}

/** PHP's round() corrects representation error before it rounds; Math.round does not. */
function channel( n ) {
    return Math.round( Number( n.toPrecision( 15 ) ) );
}

const NUMBER = '[+-]?(?:\\d+\\.?\\d*|\\.\\d+)';
const ANGLE = `${ NUMBER }(?:deg|grad|rad|turn)?`;

/**
 * An hsl() CSS parses: the space form, where any slot may be none and an alpha
 * may follow a slash, or the comma form with percentages. Ink.php reads the same.
 */
const HSL = new RegExp(
    `^hsla?\\(\\s*(?:(?:${ ANGLE }|none)\\s+(?:${ NUMBER }%|none)\\s+(?:${ NUMBER }%|none)(?:\\s*\\/\\s*(?:${ NUMBER }%?|none))?` +
    `|${ ANGLE }\\s*,\\s*${ NUMBER }%\\s*,\\s*${ NUMBER }%(?:\\s*,\\s*${ NUMBER }%?)?)\\s*\\)$`,
    'i'
);
const HUE = new RegExp( `^(${ NUMBER })(deg|grad|rad|turn)?$`, 'i' );
const PERCENT = new RegExp( `^(${ NUMBER })%?$` );
const PER_DEGREE = { deg: 1, grad: 0.9, rad: 180 / Math.PI, turn: 360 };

/**
 * A theme.json palette states its colours in whatever CSS accepts, and a ground
 * nothing can read leaves every derived ink at its stylesheet fallback.
 */
function fromHsl( parts ) {
    const bits = parts.split( /[\s,/]+/ ).filter( Boolean );
    if ( bits.length < 3 ) return null;

    const hue = angle( bits[ 0 ] );
    const sat = percent( bits[ 1 ] );
    const light = percent( bits[ 2 ] );
    const a = alpha( bits[ 3 ] );
    if ( hue === null || sat === null || light === null || a === null ) return null;

    let h = hue % 360;
    if ( h < 0 ) h += 360;
    const s = Math.max( 0, Math.min( 100, sat ) ) / 100;
    const l = Math.max( 0, Math.min( 100, light ) ) / 100;

    const c = ( 1 - Math.abs( 2 * l - 1 ) ) * s;
    const x = c * ( 1 - Math.abs( ( ( h / 60 ) % 2 ) - 1 ) );
    const m = l - c / 2;

    return [
        ...[
            [ c, x, 0 ], [ x, c, 0 ], [ 0, c, x ],
            [ 0, x, c ], [ x, 0, c ], [ c, 0, x ],
        ][ Math.floor( h / 60 ) % 6 ].map( ( n ) => channel( ( n + m ) * 255 ) ),
        a,
    ];
}

/** Degrees, or null. */
function angle( bit ) {
    if ( bit.toLowerCase() === 'none' ) return 0;

    const m = HUE.exec( bit );
    if ( ! m ) return null;

    return Number( m[ 1 ] ) * PER_DEGREE[ ( m[ 2 ] || 'deg' ).toLowerCase() ];
}

function percent( bit ) {
    if ( bit.toLowerCase() === 'none' ) return 0;

    const m = PERCENT.exec( bit );
    return m ? Number( m[ 1 ] ) : null;
}

export function luminance( value ) {
    const c = rgb( value );
    return c ? lum( c ) : null;
}

function lum( channels ) {
    const [ r, g, b ] = channels.map( ( raw ) => {
        const x = Math.max( 0, Math.min( 255, raw ) ) / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow( ( x + 0.055 ) / 1.055, 2.4 );
    } );

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = ( a, b ) => ( Math.max( lum( a ), lum( b ) ) + 0.05 ) / ( Math.min( lum( a ), lum( b ) ) + 0.05 );

/**
 * The ink the server will draw on this ground, or null when it cannot read it:
 * white or the dark ink, whichever reaches the higher contrast there.
 */
export function inkOn( ground ) {
    const g = rgb( ground );
    if ( ! g ) return null;

    return contrast( rgb( ON_DARK ), g ) >= contrast( rgb( ON_LIGHT ), g ) ? ON_DARK : ON_LIGHT;
}

/** WCAG contrast, or null when either colour cannot be read. */
export function ratio( a, b ) {
    const la = luminance( a );
    const lb = luminance( b );
    if ( la === null || lb === null ) return null;

    return ( Math.max( la, lb ) + 0.05 ) / ( Math.min( la, lb ) + 0.05 );
}

/**
 * The best any ink can do on a ground. Below 4.5 no choice of text colour
 * carries body copy on it, which is the one thing the picker cannot show.
 */
export function bestOn( ground ) {
    const ink = inkOn( ground );
    return ink === null ? null : ratio( ground, ink );
}

const ON_LIGHT_LINE = 'rgba(16,22,42,.16)';
const ON_DARK_LINE  = 'rgba(255,255,255,.26)';

/** The alpha muted ink starts from, in hundredths. */
const MUTED_FROM = { [ ON_DARK ]: 72, [ ON_LIGHT ]: 62 };

/** Ink, muted ink and hairline for a ground, or null when it cannot be read. */
export const inkPair = ( ground ) => {
    const ink = inkOn( ground );
    if ( ink === null ) return null;

    return [ ink, muted( ink, ground ), ink === ON_DARK ? ON_DARK_LINE : ON_LIGHT_LINE ];
};

/**
 * The ink at the lowest alpha, from the shipped one up, whose composite on the
 * ground reaches 4.5:1. Where none below opaque does, the ink itself.
 */
function muted( ink, ground ) {
    const [ r, g, b ] = rgb( ink );

    for ( let n = MUTED_FROM[ ink ]; n < 100; n++ ) {
        if ( ratio( mix( ink, ground, n / 100 ), ground ) >= 4.5 ) {
            return `rgba(${ r },${ g },${ b },.${ n % 10 === 0 ? n / 10 : n })`;
        }
    }

    return ink;
}

const clamp = ( n ) => Math.max( 0, Math.min( 255, n ) );

/**
 * What color-mix(in srgb, a share, b) paints, as #rrggbb, or null when either
 * colour cannot be read. The share is a's part, from 0 to 1.
 */
export function mix( a, b, share ) {
    const x = rgba( a );
    const y = rgb( b );
    if ( ! x || ! y ) return null;

    return hexOf( blend( over( x, y ), y, share ) );
}

function blend( a, b, share ) {
    return a.map( ( c, i ) => channel( share * clamp( c ) + ( 1 - share ) * clamp( b[ i ] ) ) );
}

const hexOf = ( channels ) => '#' + channels.map( ( n ) => clamp( n ).toString( 16 ).padStart( 2, '0' ) ).join( '' );

/** Whether ink, as it paints over the ground, reaches 4.5:1 there. An unreadable colour does not. */
function carries( ink, ground ) {
    const i = rgba( ink );
    const g = rgb( ground );

    return !! i && !! g && contrast( over( i, g ), g ) >= 4.5;
}

/**
 * The properties Ink.php derives and emits alongside the authored map, keyed
 * the way a style attribute wants them. A ground it cannot read contributes no
 * measured ink, so the stylesheet's own fallback stands.
 *
 * @param {Record<string,string>} tokens the authored map, without the leading --
 * @return {Record<string,string>} the derived properties, ready for a style attribute.
 */
export function derivedInk( tokens = {} ) {
    const out = {};

    const accentValue = tokens[ 'gratora-accent' ];

    const accent = inkPair( accentValue );
    if ( accent ) {
        out[ '--gratora-on-accent' ] = accent[ 0 ];
        out[ '--gratora-on-accent-muted' ] = accent[ 1 ];
        out[ '--gratora-on-accent-line' ] = accent[ 2 ];
    }

    const soft = inkPair( tokens[ 'gratora-bg-soft' ] );
    if ( soft ) {
        out[ '--gratora-on-soft' ] = soft[ 0 ];
        out[ '--gratora-on-soft-muted' ] = soft[ 1 ];
        out[ '--gratora-on-soft-accent' ] = carries( accentValue, tokens[ 'gratora-bg-soft' ] ) ? accentValue : soft[ 0 ];
    }

    const field = inkPair( tokens[ 'gratora-field-bg' ] );
    if ( field ) {
        out[ '--gratora-on-field' ] = field[ 0 ];
        out[ '--gratora-on-field-muted' ] = field[ 1 ];
    }

    return { ...out, ...groundInk( tokens ), ...ringInk( tokens ), ...requiredInk( tokens ) };
}

/**
 * Ink for the card and the selected tint, and the accent as page text. The
 * page's colour is not known, so the accent is measured against the ground the
 * page ink was chosen for: white under dark ink, dark under light.
 */
function groundInk( tokens ) {
    const text   = tokens[ 'gratora-text' ];
    const quiet  = tokens[ 'gratora-text-muted' ];
    const accent = tokens[ 'gratora-accent' ];
    const card   = tokens[ 'gratora-bg' ];
    const tint   = tokens[ 'gratora-accent-soft' ] || mix( accent, card, 0.12 );
    const onCard = inkPair( card );

    return {
        '--gratora-text-accent':    carries( accent, inkOn( text ) ) ? 'var(--gratora-accent)' : 'var(--gratora-text)',
        '--gratora-on-bg':          carries( text, card ) || ! onCard ? 'var(--gratora-text)' : onCard[ 0 ],
        '--gratora-on-bg-muted':    carries( quiet, card ) || ! onCard ? 'var(--gratora-text-muted)' : onCard[ 1 ],
        '--gratora-on-bg-accent':   carries( accent, card ) ? 'var(--gratora-accent)' : 'var(--gratora-on-bg)',
        '--gratora-on-accent-soft': carries( accent, tint ) ? 'var(--gratora-accent)' : ( inkOn( tint ) ?? 'var(--gratora-accent)' ),
    };
}

/**
 * The keyboard ring on each ground, drawn outside a control on the ground
 * around it: the ring the org chose where it reads there, else the accent as
 * that ground reads it. The page is measured as the accent is.
 */
function ringInk( tokens ) {
    const ring = tokens[ 'gratora-focus-ring' ] || '';
    const grounds = {
        'text-ring':      [ inkOn( tokens[ 'gratora-text' ] ), 'var(--gratora-text-accent)' ],
        'on-bg-ring':     [ tokens[ 'gratora-bg' ], 'var(--gratora-on-bg-accent)' ],
        'on-soft-ring':   [ tokens[ 'gratora-bg-soft' ], 'var(--gratora-on-soft-accent)' ],
        'on-accent-ring': [ tokens[ 'gratora-accent' ], 'var(--gratora-on-accent)' ],
        'on-field-ring':  [ tokens[ 'gratora-field-bg' ], 'var(--gratora-on-field)' ],
    };

    return Object.fromEntries( Object.entries( grounds ).map( ( [ name, [ ground, own ] ] ) => [
        `--gratora-${ name }`,
        ring !== '' && carries( ring, ground ) ? 'var(--gratora-focus-ring)' : own,
    ] ) );
}

/** The required marker's colour, as --gratora-required ships it. */
const REQUIRED = '#d63384';

/** The share of it the stylesheet mixes toward the ink, in hundredths. */
const REQUIRED_FROM = 72;

/**
 * The marker mixed toward the ink, as it paints over the ground, at the largest
 * share from the shipped one down that reaches 4.5:1 there. Where none does,
 * the ink.
 */
function marker( ink, ground ) {
    const g = rgb( ground );
    const i = over( rgba( ink ), g );
    const red = rgb( REQUIRED );

    for ( let n = REQUIRED_FROM; n > 0; n-- ) {
        const mixed = blend( red, i, n / 100 );
        if ( contrast( mixed, g ) >= 4.5 ) return hexOf( mixed );
    }

    return hexOf( i );
}

/**
 * The required marker on the page and on the card, mixed toward the ink each
 * reads. A ground that cannot be read measures nothing, and the stylesheet's
 * own mix stands.
 */
function requiredInk( tokens ) {
    const text = tokens[ 'gratora-text' ];
    const card = tokens[ 'gratora-bg' ];
    const out  = {};

    const page = inkOn( text );
    if ( page ) out[ '--gratora-text-required' ] = marker( text, page );

    const onCard = inkOn( card );
    if ( onCard ) out[ '--gratora-on-bg-required' ] = marker( carries( text, card ) ? text : onCard, card );

    return out;
}
