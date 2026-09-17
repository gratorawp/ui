const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"' };

/**
 * Decode the entities a RichText field stores, for display as a text node.
 *
 * Never apply it to a string that is rendered via innerHTML: that string is
 * already HTML, and decoding it there reintroduces markup.
 */
export function decodeEntities( s ) {
    if ( typeof s !== 'string' || s.indexOf( '&' ) === -1 ) return s;
    return s.replace( /&(amp|lt|gt|quot|#\d+);/g, ( match, code ) => {
        if ( code[ 0 ] !== '#' ) return NAMED[ code ];
        const n = parseInt( code.slice( 1 ), 10 );
        return n >= 0 && n <= 0x10FFFF ? String.fromCodePoint( n ) : match;
    } );
}

// Avatar initials: the first letter of the first two words, '?' when a name
// gives nothing to read.
export function initials( name ) {
    if ( ! name ) return '?';
    const parts = String( name ).trim().split( /\s+/ ).slice( 0, 2 );
    return parts.map( ( p ) => p[ 0 ] || '' ).join( '' ).toUpperCase() || '?';
}
