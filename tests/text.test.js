import { decodeEntities, initials } from '../src/utils/text';

describe( 'initials', () => {
    test( 'takes the first letter of the first two words', () => {
        expect( initials( 'Ada Lovelace' ) ).toBe( 'AL' );
        expect( initials( 'Ada' ) ).toBe( 'A' );
        expect( initials( 'Ada Byron King' ) ).toBe( 'AB' );
        expect( initials( '  ada   lovelace  ' ) ).toBe( 'AL' );
    } );

    test( 'a name with nothing to read is a question mark', () => {
        expect( initials( '' ) ).toBe( '?' );
        expect( initials( null ) ).toBe( '?' );
        expect( initials( undefined ) ).toBe( '?' );
        expect( initials( '   ' ) ).toBe( '?' );
    } );
} );

describe( 'decodeEntities', () => {
    test( 'decodes the named entities RichText stores', () => {
        expect( decodeEntities( 'Books &amp; Bread' ) ).toBe( 'Books & Bread' );
        expect( decodeEntities( '&lt;b&gt;bold&lt;/b&gt;' ) ).toBe( '<b>bold</b>' );
        expect( decodeEntities( '&quot;quoted&quot;' ) ).toBe( '"quoted"' );
    } );

    test( 'decodes numeric references', () => {
        expect( decodeEntities( 'caf&#233;' ) ).toBe( 'café' );
        expect( decodeEntities( '&#128153;' ) ).toBe( '💙' );
    } );

    test( 'leaves a reference outside Unicode alone', () => {
        expect( decodeEntities( '&#1114112;' ) ).toBe( '&#1114112;' );
    } );

    test( 'passes through anything that is not an encoded string', () => {
        expect( decodeEntities( 'plain text' ) ).toBe( 'plain text' );
        expect( decodeEntities( 42 ) ).toBe( 42 );
        expect( decodeEntities( null ) ).toBe( null );
    } );
} );
