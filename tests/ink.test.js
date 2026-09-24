/**
 * Ink.php measures the same grounds when the server renders, so every string
 * here is the one InkTest pins on the PHP side.
 */

import { rgb, ratio, inkPair, mix } from '../src/styling/ink';

const hex = ( channels ) => '#' + channels.map( ( c ) => c.toString( 16 ).padStart( 2, '0' ) ).join( '' );

/** What a translucent ink paints over its ground, rounded as the browser rounds it. */
function composite( ink, ground ) {
    const m = /^rgba\((\d+),(\d+),(\d+),(\.\d+)\)$/.exec( ink );
    if ( ! m ) return ink;

    const a = Number( m[ 4 ] );
    const g = rgb( ground );

    return hex( [ 1, 2, 3 ].map( ( i, at ) => Math.round( a * Number( m[ i ] ) + ( 1 - a ) * g[ at ] ) ) );
}

describe( 'muted ink', () => {
    test.each( [
        [ '#ffffff', 'rgba(16,22,42,.62)' ],
        [ '#15142b', 'rgba(255,255,255,.72)' ],
        [ '#221f3d', 'rgba(255,255,255,.72)' ],
        [ '#fde68a', 'rgba(16,22,42,.62)' ],
        [ '#f55151', 'rgba(16,22,42,.86)' ],
        [ '#452ef5', 'rgba(255,255,255,.74)' ],
        [ '#2563eb', 'rgba(255,255,255,.91)' ],
        [ '#ed1212', '#10162a' ],
        [ '#777777', '#10162a' ],
    ] )( 'on %s is %s', ( ground, muted ) => {
        expect( inkPair( ground )[ 1 ] ).toBe( muted );
    } );

    test( 'reads on every grey, or is the ink itself where nothing lighter does', () => {
        const failing = [];

        for ( let v = 0; v <= 255; v++ ) {
            const ground = hex( [ v, v, v ] );
            const [ ink, muted ] = inkPair( ground );

            if ( muted !== ink && ratio( composite( muted, ground ), ground ) < 4.5 ) failing.push( ground );
        }

        expect( failing ).toEqual( [] );
    } );

    test.each( [
        [ '#636363', 'rgba(255,255,255,.8)' ],
        [ '#6d6d6d', 'rgba(255,255,255,.9)' ],
        [ '#b3b3b3', 'rgba(16,22,42,.7)' ],
        [ '#989898', 'rgba(16,22,42,.8)' ],
        [ '#888888', 'rgba(16,22,42,.9)' ],
    ] )( 'a round alpha on %s drops its trailing zero: %s', ( ground, muted ) => {
        expect( inkPair( ground )[ 1 ] ).toBe( muted );
    } );

    test( 'leaves the hairline as it was', () => {
        expect( inkPair( '#ffffff' )[ 2 ] ).toBe( 'rgba(16,22,42,.16)' );
        expect( inkPair( '#15142b' )[ 2 ] ).toBe( 'rgba(255,255,255,.26)' );
    } );
} );

test( 'mixes the way color-mix in srgb paints', () => {
    expect( mix( '#fde68a', '#15142b', 0.12 ) ).toBe( '#312d36' );
    expect( mix( '#ffee58', '#ffffff', 0.12 ) ).toBe( '#fffdeb' );
    expect( mix( '#452ef5', '#804242', 0.12 ) ).toBe( '#794057' );
    expect( mix( 'inherit', '#ffffff', 0.12 ) ).toBeNull();
} );

describe( 'hsl hue units', () => {
    test.each( [
        'hsl(160deg 60% 80%)',
        'hsl(0.4444turn 60% 80%)',
        'hsl(2.7925rad 60% 80%)',
        'hsl(177.78grad 60% 80%)',
        'HSL(160DEG 60% 80%)',
        'hsl(160, 60%, 80%)',
    ] )( '%s', ( value ) => {
        expect( rgb( value ) ).toEqual( [ 173, 235, 214 ] );
    } );

    test( 'none is zero', () => {
        expect( rgb( 'hsl(none 0% 80%)' ) ).toEqual( [ 204, 204, 204 ] );
        expect( rgb( 'hsl(160 none 80%)' ) ).toEqual( [ 204, 204, 204 ] );
    } );

    test( 'anything else is no colour', () => {
        expect( rgb( 'hsl(160px 60% 80%)' ) ).toBeNull();
        expect( rgb( 'hsl(160deg 60deg 80%)' ) ).toBeNull();
        expect( rgb( 'hsl(1.2.3, 50%, 50%)' ) ).toBeNull();
        expect( rgb( 'hsl(d 60% 80%)' ) ).toBeNull();
    } );
} );
