/**
 * A channel the widget had no label for showed its key with a capital letter,
 * and the style preview's sample campaign was written as literals: both read
 * English on a translated site. The translations are loaded before the
 * modules are, as they are on a page, because both read their text on load.
 */

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { setLocaleData } from '@wordpress/i18n';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const DESCRIPTION = 'Every donation funds a new well, reaching a family of six within a week. Together we can give whole villages safe water for the first time.';

setLocaleData( {
    'Manual entry':                        [ 'Manuell erfasst' ],
    'Embedded form':                       [ 'Eingebettetes Formular' ],
    'Bring clean water to 1,000 villages': [ 'Sauberes Wasser für 1.000 Dörfer' ],
    [ DESCRIPTION ]:                       [ 'Jede Spende finanziert einen neuen Brunnen.' ],
}, 'gratora-fundraising-campaigns' );

let root = null;

function mount( element ) {
    document.body.innerHTML = '<div id="root"></div>';
    const host = document.getElementById( 'root' );

    act( () => {
        root = createRoot( host );
        root.render( element );
    } );

    return host;
}

afterEach( () => {
    act( () => root?.unmount() );
    root = null;
    document.body.innerHTML = '';
} );

test( 'money recorded by hand or through an embedded form is named in the reader\'s language', () => {
    const ChannelBreakdown = require( '../src/widgets/ChannelBreakdown' ).default;

    const host = mount(
        <ChannelBreakdown
            currency="EUR"
            rows={ [
                { channel: 'manual', amount_cents: 5000, donations_count: 1 },
                { channel: 'embed', amount_cents: 2500, donations_count: 1 },
            ] }
        />
    );

    expect( [ ...host.querySelectorAll( '.gratora-gateway__label' ) ].map( ( el ) => el.textContent ) )
        .toEqual( [ 'Manuell erfasst', 'Eingebettetes Formular' ] );
} );

test( 'the sample campaign in the style preview is in the reader\'s language', () => {
    const StylePreview = require( '../src/styling/StylePreview' ).default;

    const host = mount( <StylePreview styling={ { defaults: {} } } /> );

    expect( host.querySelector( '.gratora-style-preview__hero-title' ).textContent ).toBe( 'Sauberes Wasser für 1.000 Dörfer' );
    expect( host.querySelector( '.gratora-style-preview__desc' ).textContent ).toBe( 'Jede Spende finanziert einen neuen Brunnen.' );
} );
