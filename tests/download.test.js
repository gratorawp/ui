import apiFetch from '@wordpress/api-fetch';
import { downloadFile, saveBlob } from '../src/utils/download';

jest.mock( '@wordpress/api-fetch' );

const response = ( { ok = true, disposition = '', body = {} } = {} ) => ( {
    ok,
    status: ok ? 200 : 500,
    headers: { get: () => disposition },
    blob: async () => new Blob( [ 'x' ] ),
    json: async () => body,
} );

let anchor;

beforeEach( () => {
    jest.useFakeTimers();
    URL.createObjectURL = jest.fn( () => 'blob:probe' );
    URL.revokeObjectURL = jest.fn();
    anchor = null;
    jest.spyOn( document.body, 'appendChild' ).mockImplementation( ( node ) => {
        anchor = node;
        node.click = jest.fn();
        return node;
    } );
} );

afterEach( () => {
    jest.restoreAllMocks();
    jest.useRealTimers();
} );

test( 'the filename in the header wins over the fallback', async () => {
    apiFetch.mockResolvedValue( response( { disposition: 'attachment; filename="donations-2026.csv"' } ) );

    await downloadFile( '/gratora/v1/admin/exports/1', 'fallback.csv' );

    expect( anchor.download ).toBe( 'donations-2026.csv' );
} );

test( 'without a header the caller names the file', async () => {
    apiFetch.mockResolvedValue( response() );

    await downloadFile( '/gratora/v1/admin/exports/1', 'fallback.csv' );

    expect( anchor.download ).toBe( 'fallback.csv' );
} );

test( 'a refusal throws what the body says', async () => {
    apiFetch.mockResolvedValue( response( { ok: false, body: { message: 'Not permitted' } } ) );

    await expect( downloadFile( '/gratora/v1/admin/exports/1' ) ).rejects.toThrow( 'Not permitted' );
} );

test( 'the blob url outlives the click', () => {
    saveBlob( new Blob( [ 'x' ] ), 'x.csv' );

    expect( URL.revokeObjectURL ).not.toHaveBeenCalled();
    jest.advanceTimersByTime( 1500 );
    expect( URL.revokeObjectURL ).toHaveBeenCalledWith( 'blob:probe' );
} );
