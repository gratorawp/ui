/**
 * The preview stands for the published page. The page does not paint the card
 * (--gratora-bg): a Plain form and the campaign page body sit on the theme's
 * page, so ink measured against the card lands on white there.
 */

import { act } from 'react';
import { createRoot } from 'react-dom/client';

import StylePreview, { resolveEffectiveStyle } from '../src/styling/StylePreview';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const DEFAULTS = {
    'gratora-accent':      '#211d3f',
    'gratora-accent-soft': '#efedf8',
    'gratora-text':        '#111827',
    'gratora-text-muted':  '#6b7280',
    'gratora-bg':          '#ffffff',
    'gratora-field-bg':    '#ffffff',
    'gratora-bg-soft':     '#f8fafb',
    'gratora-border':      '#e5e7eb',
};

const DARK_CARD = { 'gratora-bg': '#15142b', 'gratora-bg-soft': '#221f3d', 'gratora-accent': '#fde68a' };

describe( 'a dark card', () => {
    test.each( [
        [ 'brand', { tokens: DARK_CARD, layer: 'brand', styling: { defaults: DEFAULTS } } ],
        [ 'campaign', {
            tokens:  {},
            layer:   'campaign',
            styling: { defaults: DEFAULTS, default_id: 'qa', presets: [ { id: 'qa', tokens: DARK_CARD } ] },
        } ],
    ] )( 'leaves the page ink alone on the %s layer and inks the card', ( _, props ) => {
        const style = resolveEffectiveStyle( props );

        expect( style[ '--gratora-text' ] ).toBe( '#111827' );
        expect( style[ '--gratora-text-muted' ] ).toBe( '#6b7280' );
        expect( style[ '--gratora-on-bg' ] ).toBe( '#ffffff' );
        expect( style[ '--gratora-on-bg-muted' ] ).toBe( 'rgba(255,255,255,.72)' );
    } );
} );

let root = null;

function mount( props = {} ) {
    document.body.innerHTML = '<div id="root"></div>';
    const host = document.getElementById( 'root' );

    act( () => {
        root = createRoot( host );
        root.render( <StylePreview styling={ { defaults: DEFAULTS } } { ...props } /> );
    } );

    return host;
}

afterEach( () => {
    act( () => root?.unmount() );
    root = null;
    document.body.innerHTML = '';
} );

const PHOTO = { id: 4, title: 'Wells', image_url: 'https://example.com/well.jpg' };

describe( 'the form', () => {
    test( 'holds the amounts, the fields, the button and the meta line', () => {
        const form = mount().querySelector( '.gratora-style-preview__form' );

        for ( const part of [ 'amounts', 'fields', 'cta', 'meta' ] ) {
            expect( form.querySelector( `.gratora-style-preview__${ part }` ) ).not.toBeNull();
        }
    } );

    test( 'sits on the page by default', () => {
        const form = mount().querySelector( '.gratora-style-preview__form' );

        expect( form.classList.contains( 'is-framed' ) ).toBe( false );
    } );

    test( 'is a card when the form is framed', () => {
        const form = mount( { container: 'frame' } ).querySelector( '.gratora-style-preview__form' );

        expect( form.classList.contains( 'is-framed' ) ).toBe( true );
    } );
} );

test( 'stays a picture, not a form the admin can tab into', () => {
    for ( const props of [ {}, { container: 'frame', campaign: PHOTO } ] ) {
        expect( mount( props ).querySelector( 'input, textarea, select, button, [tabindex]' ) ).toBeNull();
    }
} );
