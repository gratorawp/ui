/**
 * Ink.php measures the same grounds when the server renders, so every string
 * here is the one InkTest pins on the PHP side.
 */

import { rgb } from '../src/styling/ink';

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
