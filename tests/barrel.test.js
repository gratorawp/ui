/**
 * ESM drops a name two star-exported modules both carry, silently and at build
 * time. groupDigits was already lost that way.
 */
const MODULES = [ 'format', 'currency', 'countries', 'text', 'download', 'rest' ];

test( 'no name is exported by two of the star-exported utils', async () => {
    const owner = new Map();
    const clashes = [];

    for ( const name of MODULES ) {
        const module = await import( `../src/utils/${ name }` );
        for ( const exported of Object.keys( module ) ) {
            if ( owner.has( exported ) ) {
                clashes.push( `${ exported }: ${ owner.get( exported ) } and ${ name }` );
            }
            owner.set( exported, name );
        }
    }

    expect( clashes ).toEqual( [] );
} );

// The built barrel, because that is the file a consumer imports.
test( 'the barrel serves the four-argument groupDigits', async () => {
    const { groupDigits } = await import( '../dist/index.js' );

    expect( typeof groupDigits ).toBe( 'function' );
    expect( groupDigits( 1234.5, ',', '.', 2 ) ).toBe( '1,234.50' );
} );
