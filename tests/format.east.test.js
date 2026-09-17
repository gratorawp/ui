import {
    formatDate,
    formatDateTime,
    formatDayMonth,
    formatTime,
    parseTimestamp,
} from '../src/utils/format';

// 12:44 UTC is 14:44 CEST on this date.
const AT = '2026-09-02 12:44:00';

// Jest hands the sandbox a copy of process.env, so a TZ set here never reaches
// the date cache. `npm test` sets it for the run; refuse to assert without it.
beforeAll( () => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if ( zone !== 'Europe/Zagreb' ) {
        throw new Error( `These assertions read the clock east of Greenwich, and this run is in ${ zone }. Use npm test.` );
    }
} );

beforeEach( () => {
    document.documentElement.lang = 'en-US';
} );

describe( 'date renderers east of Greenwich', () => {
    test( 'a timestamp renders in the local day and hour', () => {
        expect( formatDate( AT ) ).toBe( 'Sep 02, 2026' );
        expect( formatDateTime( AT ) ).toBe( 'Sep 02, 2026, 02:44 PM' );
        expect( formatTime( AT ) ).toBe( '02:44 PM' );
    } );

    test( 'a 24-hour site language renders a 24-hour clock', () => {
        document.documentElement.lang = 'en-GB';

        expect( formatTime( AT ) ).toBe( '14:44' );
    } );
} );

describe( 'date-only values east of Greenwich', () => {
    test( 'parseTimestamp anchors the calendar day at noon UTC', () => {
        expect( parseTimestamp( '2026-09-02' ).toISOString() ).toBe( '2026-09-02T12:00:00.000Z' );
    } );

    test( 'a date-only value renders as that calendar day', () => {
        expect( formatDate( '2026-09-02' ) ).toBe( 'Sep 02, 2026' );
        expect( formatDayMonth( '2026-09-02' ) ).toBe( 'Sep 02' );
        expect( formatDate( '2026-01-01' ) ).toBe( 'Jan 01, 2026' );
    } );
} );
