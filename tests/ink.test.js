/**
 * Ink.php measures the same grounds when the server renders, so every string
 * here is the one InkTest pins on the PHP side.
 */

import { rgb, ratio, inkOn, inkPair, mix, bestOn, derivedInk } from '../src/styling/ink';

const hex = ( channels ) => '#' + channels.map( ( c ) => c.toString( 16 ).padStart( 2, '0' ) ).join( '' );

/** What a translucent ink paints over its ground, rounded as the browser rounds it. */
function composite( ink, ground ) {
    const m = /^rgba\((\d+),(\d+),(\d+),(\.\d+)\)$/.exec( ink );
    if ( ! m ) return ink;

    const a = Number( m[ 4 ] );
    const g = rgb( ground );

    return hex( [ 1, 2, 3 ].map( ( i, at ) => Math.round( a * Number( m[ i ] ) + ( 1 - a ) * g[ at ] ) ) );
}

/** White or the dark ink, whichever reads better: the two cross where each reaches the same contrast, not where black and white do. */
describe( 'the ink a ground takes', () => {
    test.each( [
        [ '#0072f0', 4.50 ],
        [ '#006ffa', 4.51 ],
        [ '#767676', 4.54 ],
        [ '#777777', 4.48 ],
        [ '#ed1212', 4.47 ],
    ] )( 'is white on %s, where white reaches %s and the dark ink under 4.1', ( ground, reaches ) => {
        expect( inkOn( ground ) ).toBe( '#ffffff' );
        expect( bestOn( ground ) ).toBeCloseTo( reaches, 2 );
        expect( ratio( '#10162a', ground ) ).toBeLessThan( 4.1 );
    } );

    test( 'reads at least as well as the other on every grey', () => {
        const worse = [];

        for ( let v = 0; v <= 255; v++ ) {
            const ground = hex( [ v, v, v ] );
            const other = inkOn( ground ) === '#ffffff' ? '#10162a' : '#ffffff';

            if ( bestOn( ground ) < ratio( other, ground ) ) worse.push( ground );
        }

        expect( worse ).toEqual( [] );
    } );

    test( 'is dark where the dark ink reads better', () => {
        expect( inkOn( '#7b7b7b' ) ).toBe( '#10162a' );
        expect( inkOn( '#f55151' ) ).toBe( '#10162a' );
    } );
} );

describe( 'muted ink', () => {
    test.each( [
        [ '#ffffff', 'rgba(16,22,42,.62)' ],
        [ '#15142b', 'rgba(255,255,255,.72)' ],
        [ '#221f3d', 'rgba(255,255,255,.72)' ],
        [ '#fde68a', 'rgba(16,22,42,.62)' ],
        [ '#f55151', 'rgba(16,22,42,.86)' ],
        [ '#452ef5', 'rgba(255,255,255,.74)' ],
        [ '#2563eb', 'rgba(255,255,255,.91)' ],
        [ '#ed1212', '#ffffff' ],
        [ '#777777', '#ffffff' ],
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

describe( 'ink for each ground', () => {
    const SHIPPED = {
        'gratora-accent':      '#211d3f',
        'gratora-accent-soft': '#efedf8',
        'gratora-text':        '#111827',
        'gratora-text-muted':  '#6b7280',
        'gratora-bg':          '#ffffff',
        'gratora-field-bg':    '#ffffff',
        'gratora-bg-soft':     '#f8fafb',
    };

    const QA = {
        ...SHIPPED,
        'gratora-accent':  '#fde68a',
        'gratora-bg':      '#15142b',
        'gratora-bg-soft': '#221f3d',
        'gratora-border':  '#3a3660',
    };
    delete QA[ 'gratora-accent-soft' ];

    const GROUND_KEYS = [
        '--gratora-text-accent',
        '--gratora-on-bg',
        '--gratora-on-bg-muted',
        '--gratora-on-bg-accent',
        '--gratora-on-accent-soft',
    ];

    const grounds = ( tokens ) => {
        const out = derivedInk( tokens );
        return Object.fromEntries( GROUND_KEYS.map( ( k ) => [ k, out[ k ] ] ) );
    };

    test( 'QA Dark Pale', () => {
        expect( grounds( QA ) ).toEqual( {
            '--gratora-text-accent':   'var(--gratora-text)',
            '--gratora-on-bg':         '#ffffff',
            '--gratora-on-bg-muted':   'rgba(255,255,255,.72)',
            '--gratora-on-bg-accent':  'var(--gratora-accent)',
            '--gratora-on-accent-soft': 'var(--gratora-accent)',
        } );
    } );

    test( 'the shipped brand names only what the page already paints', () => {
        expect( grounds( SHIPPED ) ).toEqual( {
            '--gratora-text-accent':   'var(--gratora-accent)',
            '--gratora-on-bg':         'var(--gratora-text)',
            '--gratora-on-bg-muted':   'var(--gratora-text-muted)',
            '--gratora-on-bg-accent':  'var(--gratora-accent)',
            '--gratora-on-accent-soft': 'var(--gratora-accent)',
        } );
    } );

    test( 'chosen ink stays on a card it reads on, and measured muted takes over where it does not', () => {
        const out = grounds( { ...SHIPPED, 'gratora-accent': '#0f3d5c', 'gratora-bg': '#f55151' } );

        expect( out[ '--gratora-on-bg' ] ).toBe( 'var(--gratora-text)' );
        expect( out[ '--gratora-on-bg-muted' ] ).toBe( 'rgba(16,22,42,.86)' );
    } );

    test( 'a pale accent on its own tint takes measured ink', () => {
        const site = { ...SHIPPED, 'gratora-accent': '#ffee58' };
        delete site[ 'gratora-accent-soft' ];

        expect( grounds( site )[ '--gratora-on-accent-soft' ] ).toBe( '#10162a' );
    } );

    test( 'a mid accent on a tinted card takes white', () => {
        const classic = { ...SHIPPED, 'gratora-accent': '#452ef5', 'gratora-bg': '#804242' };
        delete classic[ 'gratora-accent-soft' ];

        expect( grounds( classic )[ '--gratora-on-accent-soft' ] ).toBe( '#ffffff' );
    } );

    test( 'a tint the map states is the one measured', () => {
        const out = grounds( { ...SHIPPED, 'gratora-accent': '#ffee58', 'gratora-accent-soft': '#211d3f' } );

        expect( out[ '--gratora-on-accent-soft' ] ).toBe( 'var(--gratora-accent)' );
    } );

    test( 'the accent stands down to the card ink where it does not read on the card', () => {
        const out = grounds( { ...SHIPPED, 'gratora-accent': '#0f3d5c', 'gratora-bg': '#15142b' } );

        expect( out[ '--gratora-on-bg-accent' ] ).toBe( 'var(--gratora-on-bg)' );
    } );

    test( 'the accent as page text is measured against the ground the page ink reads on', () => {
        expect( grounds( { ...SHIPPED, 'gratora-text': '#ffffff', 'gratora-accent': '#fde68a' } )[ '--gratora-text-accent' ] )
            .toBe( 'var(--gratora-accent)' );
        expect( grounds( { ...SHIPPED, 'gratora-accent': '#fde68a' } )[ '--gratora-text-accent' ] )
            .toBe( 'var(--gratora-text)' );
    } );
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

    /** CSS drops these, and so does Ink.php, so the preview measures none of them. */
    test.each( [
        'hsl(160 deg 60% 80%)',
        'hsl(deg)',
        'hsl(160degdeg 60% 80%)',
        'hsl(160 60% 80% 90%)',
        'hsl(none, 60%, 80%)',
        'hsl(160deg, 60% 80%)',
        'hsl(160, 60, 80)',
        'hsl(160 60% 80% / .5 / .5)',
    ] )( '%s is no colour', ( value ) => {
        expect( rgb( value ) ).toBeNull();
    } );

    test.each( [
        'hsl(160deg 60% 80% / 1)',
        'hsl(160, 60%, 80%, 100%)',
        'hsla(160deg 60% 80% / 100%)',
    ] )( '%s is a colour', ( value ) => {
        expect( rgb( value ) ).toEqual( [ 173, 235, 214 ] );
    } );
} );

/** Ink.php reads a translucent ground as it lands on white, and translucent ink over its ground. */
describe( 'translucent colours', () => {
    test( 'a ground is read as it lands on white', () => {
        expect( rgb( '#10162a26' ) ).toEqual( [ 219, 220, 223 ] );
        expect( rgb( 'hsla(280, 50%, 40%, .5)' ) ).toEqual( [ 187, 153, 204 ] );
        expect( rgb( 'hsl(280 50% 40% / 50%)' ) ).toEqual( [ 187, 153, 204 ] );
        expect( inkOn( 'rgba(33, 29, 63, 0.12)' ) ).toBe( '#10162a' );
        expect( inkOn( '#0000001a' ) ).toBe( '#10162a' );
    } );

    test( 'a faint accent is neither page text nor card text', () => {
        const out = derivedInk( {
            'gratora-accent':     'rgba(16,22,42,.15)',
            'gratora-text':       '#111827',
            'gratora-text-muted': '#6b7280',
            'gratora-bg':         '#ffffff',
            'gratora-bg-soft':    '#f8fafb',
        } );

        expect( out[ '--gratora-text-accent' ] ).toBe( 'var(--gratora-text)' );
        expect( out[ '--gratora-on-bg-accent' ] ).toBe( 'var(--gratora-on-bg)' );
        expect( out[ '--gratora-on-soft-accent' ] ).toBe( '#10162a' );
    } );

    test( 'a translucent colour mixes as it lies on the other', () => {
        expect( mix( 'rgba(253,230,138,.5)', '#15142b', 0.12 ) ).toBe( mix( mix( '#fde68a', '#15142b', 0.5 ), '#15142b', 0.12 ) );
    } );
} );

/** The keyboard ring on each ground, as Ink::ringDeclarations emits it. */
describe( 'the keyboard ring', () => {
    const SHIPPED = {
        'gratora-accent':      '#211d3f',
        'gratora-accent-soft': '#efedf8',
        'gratora-text':        '#111827',
        'gratora-text-muted':  '#6b7280',
        'gratora-bg':          '#ffffff',
        'gratora-field-bg':    '#ffffff',
        'gratora-bg-soft':     '#f8fafb',
    };
    const rings = ( tokens ) => Object.fromEntries( Object.entries( derivedInk( tokens ) ).filter( ( [ k ] ) => k.endsWith( '-ring' ) ) );

    test( 'is the accent as each ground reads it where nothing chose one', () => {
        const expected = {
            '--gratora-text-ring':      'var(--gratora-text-accent)',
            '--gratora-on-bg-ring':     'var(--gratora-on-bg-accent)',
            '--gratora-on-soft-ring':   'var(--gratora-on-soft-accent)',
            '--gratora-on-accent-ring': 'var(--gratora-on-accent)',
            '--gratora-on-field-ring':  'var(--gratora-on-field)',
        };

        expect( rings( SHIPPED ) ).toEqual( expected );
        expect( rings( { ...SHIPPED, 'gratora-bg': '#15142b', 'gratora-accent': '#fde68a' } ) ).toEqual( expected );
    } );

    test( 'is the one the org chose only where it reads', () => {
        expect( rings( { ...SHIPPED, 'gratora-accent': '#0f3d5c', 'gratora-focus-ring': '#0F3D5C', 'gratora-bg': '#f55151' } ) ).toEqual( {
            '--gratora-text-ring':      'var(--gratora-focus-ring)',
            '--gratora-on-bg-ring':     'var(--gratora-on-bg-accent)',
            '--gratora-on-soft-ring':   'var(--gratora-focus-ring)',
            '--gratora-on-accent-ring': 'var(--gratora-on-accent)',
            '--gratora-on-field-ring':  'var(--gratora-focus-ring)',
        } );
    } );

    test( 'leaves each ground its own where the chosen ring or the page cannot be read', () => {
        expect( rings( { ...SHIPPED, 'gratora-focus-ring': 'transparent' } )[ '--gratora-text-ring' ] ).toBe( 'var(--gratora-text-accent)' );
        expect( rings( { 'gratora-focus-ring': '#0f3d5c', 'gratora-text': 'inherit' } )[ '--gratora-text-ring' ] ).toBe( 'var(--gratora-text-accent)' );
    } );
} );

/** What a hovered tile and secondary button paint, as Ink::softDeclarations emits it. */
describe( 'the soft hovers', () => {
    const hovers = ( soft, border ) => {
        const out = derivedInk( { 'gratora-bg-soft': soft, 'gratora-border': border, 'gratora-accent': '#211d3f' } );
        return [ out[ '--gratora-soft-hover' ], out[ '--gratora-secondary-hover' ] ];
    };

    test( 'keep the fill the stylesheet paints where the ink reads', () => {
        expect( hovers( '#221f3d', '#3a3660' ) ).toEqual( [ '#34314d', mix( '#3a3660', '#221f3d', 0.45 ) ] );
    } );

    test( 'move away from ink the tile would lose, and the button takes the tile', () => {
        expect( hovers( '#e8590c', '#e5e7eb' )[ 0 ] ).toBe( mix( '#ffffff', '#e8590c', 0.08 ) );
        expect( hovers( '#221f3d', '#e5e7eb' )[ 1 ] ).toBe( '#34314d' );
    } );

    test( 'read on every grey where the rest does', () => {
        for ( let v = 0; v <= 255; v++ ) {
            const grey = hex( [ v, v, v ] );
            const ink = inkPair( grey )[ 0 ];
            if ( ratio( ink, grey ) < 4.5 ) continue;

            hovers( grey, '#e5e7eb' ).forEach( ( fill ) => expect( ratio( ink, fill ) ).toBeGreaterThanOrEqual( 4.5 ) );
        }
    } );
} );

/** A hovered button's ink, as Ink::hoverDeclarations emits it. */
describe( 'the hovered button', () => {
    test.each( [
        [ { 'gratora-accent': '#211d3f' }, 'var(--gratora-on-accent)' ],
        [ { 'gratora-accent': '#fde68a' }, 'var(--gratora-on-accent)' ],
        [ { 'gratora-accent': '#f55151' }, '#ffffff' ],
        [ { 'gratora-accent': '#111827', 'gratora-button-bg': 'transparent', 'gratora-button-fg': '#111827', 'gratora-button-hover-bg': '#f3f4f6' }, 'var(--gratora-button-fg)' ],
        [ { 'gratora-accent': '#f55151', 'gratora-button-fg': '#10162a' }, '#ffffff' ],
        [ { 'gratora-accent': '#211d3f', 'gratora-button-bg': '#fef9c3' }, '#10162a' ],
        [ { 'gratora-accent': '#211d3f', 'gratora-button-hover-bg': '#fde68a' }, '#10162a' ],
    ] )( 'on %o takes %s', ( tokens, ink ) => {
        expect( derivedInk( tokens )[ '--gratora-on-button-hover' ] ).toBe( ink );
    } );

    test( 'measures nothing on a fill it cannot read', () => {
        expect( derivedInk( { 'gratora-accent': 'inherit' } ) ).not.toHaveProperty( '--gratora-on-button-hover' );
        expect( derivedInk( { 'gratora-accent': '#211d3f', 'gratora-button-bg': 'transparent' } ) ).not.toHaveProperty( '--gratora-on-button-hover' );
    } );
} );

/** The required marker on the page and on the card, as Ink::requiredDeclarations emits it. */
describe( 'the required marker', () => {
    const PAGE_INK = { 'gratora-text': '#111827', 'gratora-text-muted': '#6b7280' };
    const markers = ( tokens ) => {
        const out = derivedInk( tokens );
        return Object.fromEntries( Object.entries( out ).filter( ( [ k ] ) => k.endsWith( '-required' ) ) );
    };

    test( 'keeps its mix where it reads', () => {
        expect( markers( { ...PAGE_INK, 'gratora-bg': '#15142b' } ) ).toEqual( {
            '--gratora-text-required':  '#9f2b6a',
            '--gratora-on-bg-required': '#e16ca6',
        } );
    } );

    test( 'takes more ink on a card that defeats the mix', () => {
        expect( markers( { ...PAGE_INK, 'gratora-bg': '#f55151' } )[ '--gratora-on-bg-required' ] ).toBe( '#321d37' );
    } );

    test( 'reads on every grey card, or is the ink itself where nothing lighter does', () => {
        for ( let v = 0; v <= 255; v++ ) {
            const card = hex( [ v, v, v ] );
            const ink = ratio( '#111827', card ) >= 4.5 ? '#111827' : inkPair( card )[ 0 ];
            const marker = markers( { ...PAGE_INK, 'gratora-bg': card } )[ '--gratora-on-bg-required' ];

            expect( ratio( marker, card ) >= 4.5 || marker === ink ).toBe( true );
        }
    } );

    test( 'measures nothing on a ground it cannot read', () => {
        expect( markers( { 'gratora-text': 'inherit', 'gratora-bg': 'transparent' } ) ).toEqual( {} );
        expect( markers( { 'gratora-text': 'inherit', 'gratora-bg': '#15142b' } ) ).toEqual( { '--gratora-on-bg-required': '#e16ca6' } );
    } );
} );
