import {
    formatDate,
    formatDateTime,
    formatDayMonth,
    formatDayMonthYear,
    formatMonth,
    formatTime,
    parseTimestamp,
    timeAgo,
} from '../src/utils/format';

const RENDERERS = [ formatDate, formatDateTime, formatDayMonth, formatDayMonthYear, formatMonth, formatTime ];

// 14:44 UTC is 07:44 PDT on this date.
const AT = '2026-09-02 14:44:00';

const ago = ( seconds ) => new Date( Date.now() - seconds * 1000 ).toISOString();

// Jest hands the sandbox a copy of process.env, so a TZ set here never reaches
// the date cache. `npm test` sets it for the run; refuse to assert without it.
beforeAll( () => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if ( zone !== 'America/Los_Angeles' ) {
        throw new Error( `These assertions read the clock west of Greenwich, and this run is in ${ zone }. Use npm test.` );
    }
} );

beforeEach( () => {
    document.documentElement.lang = 'en-US';
} );

describe( 'date renderers', () => {
    test( 'each renders its own shape', () => {
        expect( formatDate( AT ) ).toBe( 'Sep 02, 2026' );
        expect( formatDateTime( AT ) ).toBe( 'Sep 02, 2026, 07:44 AM' );
        expect( formatDayMonth( AT ) ).toBe( 'Sep 02' );
        expect( formatDayMonthYear( AT ) ).toBe( 'Sep 2, 2026' );
        expect( formatMonth( AT ) ).toBe( 'Sep 2026' );
        expect( formatTime( AT ) ).toBe( '07:44 AM' );
    } );

    test( 'a falsy value renders the empty marker', () => {
        for ( const render of RENDERERS ) {
            expect( render( '' ) ).toBe( '-' );
            expect( render( null ) ).toBe( '-' );
            expect( render( undefined ) ).toBe( '-' );
            expect( render( '', { empty: '' } ) ).toBe( '' );
        }
    } );

    test( 'an unparseable value comes back raw', () => {
        for ( const render of RENDERERS ) {
            expect( render( 'banana' ) ).toBe( 'banana' );
        }
    } );

    test( 'the site language decides the shape', () => {
        document.documentElement.lang = 'ja-JP';

        expect( formatDate( AT ) ).toBe( '2026年9月02日' );
        expect( formatMonth( AT ) ).toBe( '2026年9月' );
    } );
} );

describe( 'date-only values west of Greenwich', () => {
    test( 'parseTimestamp anchors the calendar day at noon UTC', () => {
        expect( parseTimestamp( '2026-09-02' ).toISOString() ).toBe( '2026-09-02T12:00:00.000Z' );
    } );

    test( 'a date-only value renders as that calendar day', () => {
        expect( formatDate( '2026-09-02' ) ).toBe( 'Sep 02, 2026' );
        expect( formatDayMonth( '2026-09-02' ) ).toBe( 'Sep 02' );
        expect( formatDayMonthYear( '2026-01-01' ) ).toBe( 'Jan 1, 2026' );
    } );

    test( 'a value carrying a time keeps the UTC reading', () => {
        expect( parseTimestamp( AT ).toISOString() ).toBe( '2026-09-02T14:44:00.000Z' );
        expect( parseTimestamp( '2026-09-02T14:44:00+02:00' ).toISOString() ).toBe( '2026-09-02T12:44:00.000Z' );
    } );
} );

describe( 'the site language', () => {
    test( 'a tag Intl refuses costs the month names, not the date', () => {
        document.documentElement.lang = 'pt-PT-ao90';

        expect( formatDate( AT ) ).toBe( 'Sep 02, 2026' );
        expect( timeAgo( ago( 5 * 60 ) ) ).toBe( '5m ago' );
    } );

    test( 'an underscored locale is read as its hyphenated tag', () => {
        document.documentElement.lang = 'ja_JP';

        expect( formatDate( AT ) ).toBe( '2026年9月02日' );
    } );
} );

describe( 'a calendar day has no clock reading', () => {
    test( 'asking a date-only value for the time drops it', () => {
        expect( formatDateTime( '2026-09-02' ) ).toBe( 'Sep 02, 2026' );
    } );

    test( 'a renderer that is only a time answers with the empty marker', () => {
        expect( formatTime( '2026-09-02' ) ).toBe( '-' );
        expect( formatTime( '2026-09-02', { empty: '' } ) ).toBe( '' );
    } );
} );

describe( 'timeAgo', () => {
    test( 'answers in the largest unit that fits', () => {
        expect( timeAgo( ago( 30 ) ) ).toBe( 'now' );
        expect( timeAgo( ago( 5 * 60 ) ) ).toBe( '5m ago' );
        expect( timeAgo( ago( 3 * 3600 ) ) ).toBe( '3h ago' );
        expect( timeAgo( ago( 2 * 86400 ) ) ).toBe( '2d ago' );
        expect( timeAgo( ago( 21 * 86400 ) ) ).toBe( '3w ago' );
        expect( timeAgo( ago( 160 * 86400 ) ) ).toBe( '5mo ago' );
        expect( timeAgo( ago( 800 * 86400 ) ) ).toBe( '2y ago' );
    } );

    test( 'a single unit is counted, not named', () => {
        expect( timeAgo( ago( 86400 ) ) ).toBe( '1d ago' );
        expect( timeAgo( ago( 7 * 86400 ) ) ).toBe( '1w ago' );
        expect( timeAgo( ago( 31 * 86400 ) ) ).toBe( '1mo ago' );
        expect( timeAgo( ago( 370 * 86400 ) ) ).toBe( '1y ago' );
    } );

    test( 'a future timestamp past clock skew states the date', () => {
        expect( timeAgo( ago( -30 ) ) ).toBe( 'now' );
        expect( timeAgo( '2099-09-02 14:44:00' ) ).toBe( formatDate( '2099-09-02 14:44:00' ) );
        expect( timeAgo( '2099-09-02 14:44:00' ) ).toBe( 'Sep 02, 2099' );
    } );

    test( 'empty and unparseable values behave like the renderers', () => {
        expect( timeAgo( '' ) ).toBe( '-' );
        expect( timeAgo( null, { empty: '' } ) ).toBe( '' );
        expect( timeAgo( 'banana' ) ).toBe( 'banana' );
    } );

    test( 'the site language decides the words', () => {
        document.documentElement.lang = 'ja-JP';

        expect( timeAgo( ago( 5 * 60 ) ) ).toBe( '5分前' );
    } );
} );
