/**
 * Repeats a refused request without the WP nonce.
 *
 * Routes that authenticate themselves (a donor session cookie, a donation's
 * status token) never read the nonce, but WordPress refuses a PRESENT-and-stale
 * one at the authentication layer, ahead of every permission callback. The
 * nonce is minted at render and cannot be refreshed here, so a tab left open
 * overnight sends the request unauthenticated rather than not at all.
 *
 * @param {(nonce: string) => Promise<Response>} attempt
 * @param {string}                               nonce
 */
export async function withNonceFallback( attempt, nonce ) {
    const res = await attempt( nonce );
    if ( ! nonce || res.status !== 403 ) return res;

    const why = await res.clone().json().catch( () => null );

    return why?.code === 'rest_cookie_invalid_nonce' ? attempt( '' ) : res;
}
