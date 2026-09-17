import { withNonceFallback } from '../src/utils/rest';

const response = ( status, body ) => ( {
    status,
    clone: () => ( {
        json: () => ( body === undefined
            ? Promise.reject( new Error( 'not JSON' ) )
            : Promise.resolve( body ) ),
    } ),
} );

const staleNonce = response( 403, { code: 'rest_cookie_invalid_nonce' } );

test( 'a successful attempt is returned as it stands', async () => {
    const ok = response( 200 );
    const attempt = jest.fn().mockResolvedValue( ok );

    await expect( withNonceFallback( attempt, 'abc123' ) ).resolves.toBe( ok );
    expect( attempt.mock.calls ).toEqual( [ [ 'abc123' ] ] );
} );

test( 'a stale nonce is dropped and the request repeated', async () => {
    const retried = response( 200 );
    const attempt = jest.fn()
        .mockResolvedValueOnce( staleNonce )
        .mockResolvedValueOnce( retried );

    await expect( withNonceFallback( attempt, 'abc123' ) ).resolves.toBe( retried );
    expect( attempt.mock.calls ).toEqual( [ [ 'abc123' ], [ '' ] ] );
} );

test( 'a 403 for any other reason stands', async () => {
    const forbidden = response( 403, { code: 'rest_forbidden' } );
    const attempt = jest.fn().mockResolvedValue( forbidden );

    await expect( withNonceFallback( attempt, 'abc123' ) ).resolves.toBe( forbidden );
    expect( attempt ).toHaveBeenCalledTimes( 1 );
} );

test( 'a 403 with an unreadable body stands', async () => {
    const forbidden = response( 403 );
    const attempt = jest.fn().mockResolvedValue( forbidden );

    await expect( withNonceFallback( attempt, 'abc123' ) ).resolves.toBe( forbidden );
    expect( attempt ).toHaveBeenCalledTimes( 1 );
} );

test( 'a request that sent no nonce has nothing to drop', async () => {
    const attempt = jest.fn().mockResolvedValue( staleNonce );

    await expect( withNonceFallback( attempt, '' ) ).resolves.toBe( staleNonce );
    expect( attempt.mock.calls ).toEqual( [ [ '' ] ] );
} );
