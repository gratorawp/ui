/**
 * Currency, country, and locale reference data for admin pickers.
 */

export const CURRENCIES = [
    { code: 'EUR', symbol: '€',  label: 'Euro' },
    { code: 'USD', symbol: '$',  label: 'US dollar' },
    { code: 'GBP', symbol: '£',  label: 'British pound' },
    { code: 'CHF', symbol: 'Fr', label: 'Swiss franc' },
    { code: 'SEK', symbol: 'kr', label: 'Swedish krona' },
    { code: 'NOK', symbol: 'kr', label: 'Norwegian krone' },
    { code: 'DKK', symbol: 'kr', label: 'Danish krone' },
    { code: 'PLN', symbol: 'zł', label: 'Polish złoty' },
    { code: 'CZK', symbol: 'Kč', label: 'Czech koruna' },
    { code: 'HUF', symbol: 'Ft', label: 'Hungarian forint' },
    { code: 'RON', symbol: 'lei', label: 'Romanian leu' },
    { code: 'BGN', symbol: 'лв', label: 'Bulgarian lev' },
    { code: 'JPY', symbol: '¥',  label: 'Japanese yen' },
    { code: 'CAD', symbol: 'C$', label: 'Canadian dollar' },
    { code: 'AUD', symbol: 'A$', label: 'Australian dollar' },
    { code: 'NZD', symbol: 'NZ$',label: 'New Zealand dollar' },
    { code: 'INR', symbol: '₹',  label: 'Indian rupee' },
    { code: 'BRL', symbol: 'R$', label: 'Brazilian real' },
    { code: 'MXN', symbol: 'MX$',label: 'Mexican peso' },
    { code: 'ZAR', symbol: 'R',  label: 'South African rand' },
    { code: 'SGD', symbol: 'S$', label: 'Singapore dollar' },
    { code: 'HKD', symbol: 'HK$',label: 'Hong Kong dollar' },
];

export function currencyByCode( code ) {
    return CURRENCIES.find( ( c ) => c.code === code ) || null;
}

export function currencySymbol( code ) {
    return currencyByCode( code )?.symbol || ( code || '' );
}

// US-style: `1,234.56`; EU-style: `1.234,56`.
export function separatorsFor( format ) {
    return format === 'eu'
        ? { thousand: '.', decimal: ',' }
        : { thousand: ',', decimal: '.' };
}

// Format a number with thousand separators; no symbol or sign.
export function groupDigitsForPreset( amount, format = 'us', decimalPlaces = 0 ) {
    if ( amount === '' || amount === null || amount === undefined ) return '';
    const n = Number( amount );
    if ( ! Number.isFinite( n ) ) return '';
    const seps  = separatorsFor( format );
    const fixed = decimalPlaces > 0 ? Math.abs( n ).toFixed( decimalPlaces ) : String( Math.trunc( Math.abs( n ) ) );
    const [ whole, frac ] = fixed.split( '.' );
    const grouped = whole.replace( /\B(?=(\d{3})+(?!\d))/g, seps.thousand );
    const sign = n < 0 ? '-' : '';
    return decimalPlaces > 0 && frac
        ? `${ sign }${ grouped }${ seps.decimal }${ frac }`
        : `${ sign }${ grouped }`;
}

// Parse a user-typed string to a number, stripping separators.
export function ungroupDigits( text, format = 'us' ) {
    if ( typeof text !== 'string' || text === '' ) return 0;
    const seps = separatorsFor( format );
    let cleaned = text;
    cleaned = cleaned.split( seps.thousand ).join( '' );
    if ( seps.decimal !== '.' ) {
        cleaned = cleaned.replace( seps.decimal, '.' );
    }
    cleaned = cleaned.replace( /[^0-9.\-]/g, '' );
    const n = parseFloat( cleaned );
    return Number.isFinite( n ) ? n : 0;
}

export const LOCALES = [
    { code: '',        label: 'Use site default (WP locale)' },
    { code: 'en-US',   label: 'English (United States)' },
    { code: 'en-GB',   label: 'English (United Kingdom)' },
    { code: 'de-DE',   label: 'German (Germany)' },
    { code: 'de-AT',   label: 'German (Austria)' },
    { code: 'de-CH',   label: 'German (Switzerland)' },
    { code: 'fr-FR',   label: 'French (France)' },
    { code: 'fr-BE',   label: 'French (Belgium)' },
    { code: 'es-ES',   label: 'Spanish (Spain)' },
    { code: 'it-IT',   label: 'Italian' },
    { code: 'nl-NL',   label: 'Dutch (Netherlands)' },
    { code: 'nl-BE',   label: 'Dutch (Belgium)' },
    { code: 'pt-PT',   label: 'Portuguese (Portugal)' },
    { code: 'pl-PL',   label: 'Polish' },
    { code: 'cs-CZ',   label: 'Czech' },
    { code: 'sv-SE',   label: 'Swedish' },
    { code: 'da-DK',   label: 'Danish' },
    { code: 'fi-FI',   label: 'Finnish' },
    { code: 'no-NO',   label: 'Norwegian' },
    { code: 'el-GR',   label: 'Greek' },
    { code: 'hu-HU',   label: 'Hungarian' },
    { code: 'ro-RO',   label: 'Romanian' },
    { code: 'ja-JP',   label: 'Japanese' },
];

// Pure string formatting (no Intl) so preview matches admin-configured settings regardless of browser locale.
export function previewAmount( amount, { decimalPlaces = 2, decimalSep = ',', thousandSep = '.', symbol = '€', symbolPosition = 'before' } = {} ) {
    const sign = amount < 0 ? '-' : '';
    const abs  = Math.abs( amount );
    const fixed = abs.toFixed( decimalPlaces );
    const [ whole, frac ] = fixed.split( '.' );
    const grouped = whole.replace( /\B(?=(\d{3})+(?!\d))/g, thousandSep || '' );
    const num = decimalPlaces > 0 && frac ? `${ grouped }${ decimalSep }${ frac }` : grouped;
    return symbolPosition === 'after' ? `${ sign }${ num } ${ symbol }` : `${ sign }${ symbol }${ num }`;
}
