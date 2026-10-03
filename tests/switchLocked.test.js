/**
 * wp-admin draws every disabled checkbox at 70%, and the switch keeps its own
 * checkbox invisible. On a page that loads both, the selector that ranks higher
 * decides which one the user sees.
 *
 * @jest-environment node
 */

import path from 'path';
import * as sass from 'sass';

const WP_ADMIN = 'input[type="checkbox"]:disabled';

const PARTS = /#[\w-]+|\.[\w-]+|\[[^\]]+\]|::?[\w-]+/g;

/** [ ids, classes and attributes and pseudo-classes, elements ] */
function specificity( selector ) {
    const parts = selector.match( PARTS ) || [];
    const elements = selector.replace( PARTS, ' ' ).match( /[a-z][\w-]*/gi ) || [];

    return [
        parts.filter( ( part ) => part.startsWith( '#' ) ).length,
        parts.filter( ( part ) => /^[.[]|^:[^:]/.test( part ) ).length,
        elements.length + parts.filter( ( part ) => part.startsWith( '::' ) ).length,
    ];
}

const outranks = ( a, b ) => a.find( ( n, i ) => n !== b[ i ] ) > b[ a.findIndex( ( n, i ) => n !== b[ i ] ) ];

/** Every selector of the compiled sheet that hides something, with the element it ends on. */
function hiding() {
    const { css } = sass.compile( path.join( __dirname, '../src/scss/components/_switch.scss' ), { logger: sass.Logger.silent } );

    return [ ...css.matchAll( /([^{}]+)\{([^{}]*)\}/g ) ]
        .filter( ( [ , , body ] ) => /opacity:\s*0\s*;/.test( body ) )
        .flatMap( ( [ , selectors ] ) => selectors.split( ',' ).map( ( selector ) => selector.trim() ) );
}

test( 'the specificity of a selector counts what CSS counts', () => {
    expect( specificity( WP_ADMIN ) ).toEqual( [ 0, 2, 1 ] );
    expect( specificity( '.gratora-switch input' ) ).toEqual( [ 0, 1, 1 ] );
    expect( outranks( [ 0, 3, 1 ], [ 0, 2, 1 ] ) ).toBe( true );
    expect( outranks( [ 0, 2, 1 ], [ 0, 2, 1 ] ) ).toBe( false );
} );

test( 'the rule hiding a disabled checkbox outranks the one wp-admin shows it with', () => {
    const disabled = hiding().filter( ( selector ) => /input[^ ~+>]*:disabled$/.test( selector ) );

    expect( disabled ).not.toEqual( [] );
    expect( disabled.some( ( selector ) => outranks( specificity( selector ), specificity( WP_ADMIN ) ) ) ).toBe( true );
} );
