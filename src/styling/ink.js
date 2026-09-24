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
 * Import nothing here: the public donation-form bundle depends on this module.
 */

const FLIP = 0.1791;

const ON_DARK  = '#ffffff';
const ON_LIGHT = '#10162a';

/** @return {[number,number,number]|null} the channels, or null when the value cannot be read. */
export function rgb( value ) {
    const v = String( value ?? '' ).trim();

    const hex = v.match( /^#([0-9a-fA-F]{3,8})$/ );
    if ( hex ) {
        let h = hex[ 1 ];
        if ( h.length === 3 || h.length === 4 ) h = h[ 0 ] + h[ 0 ] + h[ 1 ] + h[ 1 ] + h[ 2 ] + h[ 2 ];
        if ( h.length < 6 ) return null;

        return [ parseInt( h.slice( 0, 2 ), 16 ), parseInt( h.slice( 2, 4 ), 16 ), parseInt( h.slice( 4, 6 ), 16 ) ];
    }

    const hsl = v.match( /^hsla?\(([^)]*)\)$/i );
    if ( hsl ) return fromHsl( hsl[ 1 ] );

    const fn = v.match( /^rgba?\(([^)]*)\)$/i );
    if ( fn ) {
        const parts = fn[ 1 ].split( /[\s,/]+/ ).filter( Boolean ).slice( 0, 3 );
        if ( parts.length < 3 ) return null;
        const out = parts.map( ( p ) => {
            const n = parseFloat( p );
            if ( Number.isNaN( n ) ) return null;
            return channel( p.includes( '%' ) ? n * 2.55 : n );
        } );

        return out.some( ( n ) => n === null ) ? null : out;
    }

    return null;
}

/** PHP's round() corrects representation error before it rounds; Math.round does not. */
function channel( n ) {
    return Math.round( Number( n.toPrecision( 15 ) ) );
}

const NUMBER = '[+-]?(?:\\d+\\.?\\d*|\\.\\d+)';
const HUE = new RegExp( `^(${ NUMBER })(deg|grad|rad|turn)?$`, 'i' );
const PERCENT = new RegExp( `^(${ NUMBER })%?$` );
const PER_DEGREE = { deg: 1, grad: 0.9, rad: 180 / Math.PI, turn: 360 };

/**
 * A theme.json palette states its colours in whatever CSS accepts, and a ground
 * nothing can read leaves every derived ink at its stylesheet fallback.
 */
function fromHsl( parts ) {
    const bits = parts.split( /[\s,/]+/ ).filter( Boolean ).slice( 0, 3 );
    if ( bits.length < 3 ) return null;

    const hue = angle( bits[ 0 ] );
    const sat = percent( bits[ 1 ] );
    const light = percent( bits[ 2 ] );
    if ( hue === null || sat === null || light === null ) return null;

    let h = hue % 360;
    if ( h < 0 ) h += 360;
    const s = Math.max( 0, Math.min( 100, sat ) ) / 100;
    const l = Math.max( 0, Math.min( 100, light ) ) / 100;

    const c = ( 1 - Math.abs( 2 * l - 1 ) ) * s;
    const x = c * ( 1 - Math.abs( ( ( h / 60 ) % 2 ) - 1 ) );
    const m = l - c / 2;

    return [
        [ c, x, 0 ], [ x, c, 0 ], [ 0, c, x ],
        [ 0, x, c ], [ x, 0, c ], [ c, 0, x ],
    ][ Math.floor( h / 60 ) % 6 ].map( ( n ) => channel( ( n + m ) * 255 ) );
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
    if ( ! c ) return null;

    const [ r, g, b ] = c.map( ( raw ) => {
        const x = Math.max( 0, Math.min( 255, raw ) ) / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow( ( x + 0.055 ) / 1.055, 2.4 );
    } );

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The ink the server will draw on this ground, or null when it cannot read it. */
export function inkOn( ground ) {
    const l = luminance( ground );
    return l === null ? null : ( l > FLIP ? ON_LIGHT : ON_DARK );
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
    const x = rgb( a );
    const y = rgb( b );
    if ( ! x || ! y ) return null;

    return '#' + x.map( ( c, i ) => {
        const n = channel( share * clamp( c ) + ( 1 - share ) * clamp( y[ i ] ) );
        return n.toString( 16 ).padStart( 2, '0' );
    } ).join( '' );
}

/**
 * The properties Ink.php derives and emits alongside the authored map, keyed
 * the way a style attribute wants them. A ground it cannot read contributes
 * nothing, so the stylesheet's own fallback stands.
 *
 * @param {Record<string,string>} tokens the authored map, without the leading --
 * @return {Record<string,string>} the derived properties, ready for a style attribute.
 */
export function derivedInk( tokens = {} ) {
    const out = {};

    const accent = inkPair( tokens[ 'gratora-accent' ] );
    if ( accent ) {
        out[ '--gratora-on-accent' ] = accent[ 0 ];
        out[ '--gratora-on-accent-muted' ] = accent[ 1 ];
        out[ '--gratora-on-accent-line' ] = accent[ 2 ];
    }

    const soft = inkPair( tokens[ 'gratora-bg-soft' ] );
    if ( soft ) {
        out[ '--gratora-on-soft' ] = soft[ 0 ];
        out[ '--gratora-on-soft-muted' ] = soft[ 1 ];

        const accentValue = tokens[ 'gratora-accent' ];
        const carries = ratio( accentValue, tokens[ 'gratora-bg-soft' ] );
        out[ '--gratora-on-soft-accent' ] = carries !== null && carries >= 4.5 ? accentValue : soft[ 0 ];
    }

    const field = inkPair( tokens[ 'gratora-field-bg' ] );
    if ( field ) {
        out[ '--gratora-on-field' ] = field[ 0 ];
        out[ '--gratora-on-field-muted' ] = field[ 1 ];
    }

    return out;
}
