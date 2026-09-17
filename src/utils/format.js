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

// ISO 4217 to symbol, kept in step with Money::SYMBOLS so a screen and the
// receipt it links to name the same currency. A code that is not here renders
// as itself, which is honest; borrowing another currency's symbol is not.
export const CURRENCY_SYMBOLS = {
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
        ? ( CURRENCY_SYMBOLS[ code ] || fmt.symbol || code )
        : ( ( code === defaultCurrency() && fmt.symbol ) ? fmt.symbol : ( CURRENCY_SYMBOLS[ code ] || code ) );

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

// Dates follow the site language, which the page states on <html lang>, rather
// than the browser's own: an operator reading a Croatian admin expects Croatian
// months whatever their browser is set to.
function locale() {
    if ( typeof document === 'undefined' ) return undefined;

    const lang = document.documentElement?.lang;
    if ( typeof lang !== 'string' || lang === '' ) return undefined;

    // WordPress locales like pt_PT_ao90 reach <html lang> as pt-PT-ao90, which
    // Intl rejects. A refused tag must cost the page its month names, not its
    // dates, so fall back to the browser's own.
    const tag = lang.replace( /_/g, '-' );
    try {
        Intl.DateTimeFormat.supportedLocalesOf( tag );
        return tag;
    } catch ( _ ) {
        return undefined;
    }
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// DB timestamps are "YYYY-MM-DD HH:MM:SS" in UTC with no zone marker, which the
// browser would otherwise read as local time. Mark those UTC and leave values
// carrying a zone alone. A date-only value is a calendar day rather than an
// instant, so anchor it away from midnight: read as UTC midnight it renders as
// the day before anywhere west of Greenwich.
export function parseTimestamp( iso ) {
    const s = String( iso ).trim();

    if ( DATE_ONLY.test( s ) ) {
        const [ y, m, d ] = s.split( '-' ).map( Number );
        return new Date( Date.UTC( y, m - 1, d, 12 ) );
    }

    const hasTime  = /\d{2}:\d{2}/.test( s );
    const hasZone  = /[zZ]$|[+-]\d{2}:?\d{2}$/.test( s );
    let normalized = s.replace( ' ', 'T' );
    if ( hasTime && ! hasZone ) normalized += 'Z';
    return new Date( normalized );
}

function render( iso, empty, options ) {
    if ( ! iso ) return empty;
    const at = parseTimestamp( iso );
    if ( Number.isNaN( at.getTime() ) ) return iso;

    // A calendar day has no clock reading, and asking for one renders the
    // anchor parseTimestamp put there.
    if ( ! DATE_ONLY.test( String( iso ).trim() ) ) {
        return new Intl.DateTimeFormat( locale(), options ).format( at );
    }

    const { hour, minute, ...day } = options;
    if ( Object.keys( day ).length === 0 ) return empty;

    return new Intl.DateTimeFormat( locale(), day ).format( at );
}

export function formatDate( iso, { empty = '-' } = {} ) {
    return render( iso, empty, { year: 'numeric', month: 'short', day: '2-digit' } );
}

export function formatDateTime( iso, { empty = '-' } = {} ) {
    return render( iso, empty, {
        month: 'short', day: '2-digit', year: 'numeric',
        hour:  '2-digit', minute: '2-digit',
    } );
}

export function formatDayMonth( iso, { empty = '-' } = {} ) {
    return render( iso, empty, { month: 'short', day: '2-digit' } );
}

export function formatDayMonthYear( iso, { empty = '-' } = {} ) {
    return render( iso, empty, { day: 'numeric', month: 'short', year: 'numeric' } );
}

export function formatMonth( iso, { empty = '-' } = {} ) {
    return render( iso, empty, { month: 'short', year: 'numeric' } );
}

export function formatTime( iso, { empty = '-' } = {} ) {
    return render( iso, empty, { hour: '2-digit', minute: '2-digit' } );
}

// 'always' keeps a column uniform: under 'auto' a single week reads "last wk."
// beside its neighbours' "3w ago". Zero seconds is the exception, where 'auto'
// is the only way to say "now" instead of "in 0 seconds".
function relative( numeric ) {
    return new Intl.RelativeTimeFormat( locale(), { numeric, style: 'narrow' } );
}

// Whole months and years rather than mean ones: a stamp 30 days old reads
// "1mo ago", which is the boundary every consumer shipped before this module.
const RELATIVE_UNITS = [
    [ 'year',   31536000 ],
    [ 'month',  2592000 ],
    [ 'week',   604800 ],
    [ 'day',    86400 ],
    [ 'hour',   3600 ],
    [ 'minute', 60 ],
];

export function timeAgo( iso, { empty = '-' } = {} ) {
    if ( ! iso ) return empty;
    const at = parseTimestamp( iso );
    if ( Number.isNaN( at.getTime() ) ) return iso;

    const elapsed = ( Date.now() - at.getTime() ) / 1000;
    // "in 3 days" is not what a log column is asking, and a minute of the two
    // clocks disagreeing is not the future. Past that, state the date.
    if ( elapsed < -60 ) return formatDate( iso );

    const seconds = Math.max( 0, elapsed );

    for ( const [ unit, size ] of RELATIVE_UNITS ) {
        if ( seconds >= size ) return relative( 'always' ).format( -Math.floor( seconds / size ), unit );
    }

    return relative( 'auto' ).format( 0, 'second' );
}
