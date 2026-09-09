import { __, sprintf } from '@wordpress/i18n';

// Read lazily so runtime overrides are picked up at call time, not module load.
export function defaultCurrency() {
    if ( typeof window !== 'undefined' && window.gratora?.default_currency ) {
        return String( window.gratora.default_currency ).toUpperCase();
    }
    return 'USD';
}

const DEFAULT_NUMBER_FORMAT = {
    decimalPlaces:  2,
    decimalSep:     '.',
    thousandSep:    ',',
    symbolPosition: 'before',
    symbol:         '',
};

const FALLBACK_SYMBOLS = {
    USD: '$', EUR: '€', GBP: '£', AUD: 'A$', CAD: 'C$', CHF: 'CHF',
    JPY: '¥', CNY: '¥', SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł',
    CZK: 'Kč', HUF: 'Ft', BRL: 'R$', MXN: 'Mex$', INR: '₹', NZD: 'NZ$',
    ZAR: 'R', SGD: 'S$', HKD: 'HK$',
};

// ISO 4217 currencies whose minor unit isn't two places. Amounts are stored as
// major x 100 regardless, so this only affects how many decimals we render.
const ZERO_DECIMAL_CURRENCIES = new Set( [
    'JPY', 'KRW', 'VND', 'CLP', 'ISK', 'PYG', 'XAF', 'XOF', 'XPF',
    'BIF', 'DJF', 'GNF', 'KMF', 'RWF', 'UGX', 'VUV', 'XAG',
] );
const THREE_DECIMAL_CURRENCIES = new Set( [
    'BHD', 'KWD', 'OMR', 'TND', 'IQD', 'JOD', 'LYD',
] );

// How many decimal places a currency renders with (JPY none, BHD three, most two).
export function currencyDecimals( currency ) {
    const code = String( currency || '' ).toUpperCase();
    if ( ZERO_DECIMAL_CURRENCIES.has( code ) )  return 0;
    if ( THREE_DECIMAL_CURRENCIES.has( code ) ) return 3;
    return 2;
}

// Explicit override channel for surfaces with no window.gratora (the public
// donation form gets its format from the server form config; page-cache safe).
// Bootstrap calls setActiveNumberFormat(config.numberFormat) once; call sites
// stay zero-arg everywhere.
let activeOverride = null;

export function setActiveNumberFormat( fmt ) {
    activeOverride = fmt && typeof fmt === 'object' ? { ...fmt } : null;
}

export function getActiveNumberFormat() {
    return numberFormat();
}

// Returns { decimalPlaces, decimalSep, thousandSep, symbolPosition, symbol }:
// the explicit override when set, else the host org settings bridge.
export function numberFormat() {
    if ( activeOverride ) {
        return { ...DEFAULT_NUMBER_FORMAT, ...activeOverride };
    }
    if ( typeof window !== 'undefined' && window.gratora?.number_format ) {
        return { ...DEFAULT_NUMBER_FORMAT, ...window.gratora.number_format };
    }
    return DEFAULT_NUMBER_FORMAT;
}

/**
 * Format a cents amount using the org's configured separators and symbol position.
 * Pass { compact: true } to drop decimal places for whole amounts.
 */
export function formatAmount( cents, currency = '', opts = {} ) {
    const fmt           = numberFormat();
    const amount        = Number( cents || 0 ) / 100;
    const code          = ( String( currency || '' ).trim() || defaultCurrency() ).toUpperCase();
    const isWhole       = amount % 1 === 0;
    // Decimal count follows the currency (JPY none, BHD three). The org number
    // format only tunes its own default currency; others use their ISO places.
    // Under an explicit override there is no default-currency knowledge: the
    // configured places apply as-is and the symbol prefers the requested
    // currency's table entry (the public form's historical behavior).
    const places        = activeOverride
        ? fmt.decimalPlaces
        : ( code === defaultCurrency() ? fmt.decimalPlaces : currencyDecimals( code ) );
    const decimalPlaces = opts.compact && isWhole ? 0 : places;
    const number        = groupDigits( amount, fmt.thousandSep, fmt.decimalSep, decimalPlaces );
    // For non-default currencies fall back to the static table (injected symbol is default-currency only).
    const symbol = activeOverride
        ? ( FALLBACK_SYMBOLS[ code ] || fmt.symbol || code )
        : ( ( code === defaultCurrency() && fmt.symbol ) ? fmt.symbol : ( FALLBACK_SYMBOLS[ code ] || code ) );

    return fmt.symbolPosition === 'after'
        ? `${ number } ${ symbol }`
        : `${ symbol }${ number }`;
}

export function formatAmountCompact( cents, currency = '' ) {
    return formatAmount( cents, currency, { compact: true } );
}

export function groupDigits( amount, thousandSep, decimalSep, decimalPlaces ) {
    if ( amount === '' || amount === null || amount === undefined ) return '';
    const n = Number( amount );
    if ( ! Number.isFinite( n ) ) return '';
    const dp    = Math.max( 0, Number( decimalPlaces ) || 0 );
    const fixed = dp > 0 ? Math.abs( n ).toFixed( dp ) : String( Math.trunc( Math.abs( n ) ) );
    const [ whole, frac ] = fixed.split( '.' );
    const grouped = thousandSep
        ? whole.replace( /\B(?=(\d{3})+(?!\d))/g, thousandSep )
        : whole;
    const sign = n < 0 ? '-' : '';
    return dp > 0 && frac
        ? `${ sign }${ grouped }${ decimalSep }${ frac }`
        : `${ sign }${ grouped }`;
}

// Parses using the configured separators, so "1,000" in a US-format form is
// 1000 - not 1.00. Strip the thousands separator, normalise the decimal
// separator to '.', then read the number.
export function parseAmount( raw ) {
    if ( typeof raw !== 'string' || raw === '' ) return 0;

    const fmt  = numberFormat();
    const thou = fmt.thousandSep;
    const dec  = fmt.decimalSep || '.';

    let cleaned = raw;
    if ( thou ) cleaned = cleaned.split( thou ).join( '' );
    if ( dec !== '.' ) cleaned = cleaned.split( dec ).join( '.' );
    // Keep only digits, the (now normalised) decimal point, and a minus sign.
    cleaned = cleaned.replace( /[^\d.\-]/g, '' );
    if ( cleaned === '' ) return 0;

    const n = Number( cleaned );
    return Number.isFinite( n ) ? n : 0;
}

// DB timestamps are "YYYY-MM-DD HH:MM:SS" in UTC with no zone marker, which
// the browser would otherwise read as local time. Mark them UTC; leave values
// that already carry a zone, or are date-only, untouched.
export function parseTimestamp( iso ) {
    const s        = String( iso ).trim();
    const hasTime  = /\d{2}:\d{2}/.test( s );
    const hasZone  = /[zZ]$|[+-]\d{2}:?\d{2}$/.test( s );
    let normalized = s.replace( ' ', 'T' );
    if ( hasTime && ! hasZone ) normalized += 'Z';
    return new Date( normalized );
}

export function formatDate( iso ) {
    if ( ! iso ) return '-';
    const d = parseTimestamp( iso );
    if ( Number.isNaN( d.getTime() ) ) return iso;
    return d.toLocaleDateString( undefined, {
        year:  'numeric',
        month: 'short',
        day:   '2-digit',
    } );
}

export function timeAgo( iso ) {
    if ( ! iso ) return '-';
    const d = parseTimestamp( iso );
    if ( Number.isNaN( d.getTime() ) ) return iso;
    const diff = Math.max( 0, ( Date.now() - d.getTime() ) / 1000 );
    if ( diff < 60 )      return __( 'just now', 'gratora-fundraising-campaigns' );
    /* translators: %d: number of minutes */
    if ( diff < 3600 )    return sprintf( __( '%dm ago', 'gratora-fundraising-campaigns' ),  Math.floor( diff / 60 ) );
    /* translators: %d: number of hours */
    if ( diff < 86400 )   return sprintf( __( '%dh ago', 'gratora-fundraising-campaigns' ),  Math.floor( diff / 3600 ) );
    /* translators: %d: number of days */
    if ( diff < 604800 )  return sprintf( __( '%dd ago', 'gratora-fundraising-campaigns' ),  Math.floor( diff / 86400 ) );
    return formatDate( iso );
}
