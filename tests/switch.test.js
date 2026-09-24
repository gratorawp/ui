/**
 * The checkbox is the switch's only control. Named on its wrapper, it was a
 * checkbox with no name to a screen reader, and a switch to nobody.
 */

import { act } from 'react';
import { createRoot } from 'react-dom/client';

import { Switch, ToggleRow } from '../src/components/Switch';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root = null;

function mount( node ) {
    document.body.innerHTML = '<div id="root"></div>';
    const host = document.getElementById( 'root' );

    act( () => {
        root = createRoot( host );
        root.render( node );
    } );

    return host;
}

afterEach( () => {
    act( () => root?.unmount() );
    root = null;
    document.body.innerHTML = '';
} );

test( 'the input is a switch named by its label', () => {
    const input = mount( <Switch label="Customize tokens" checked={ false } onChange={ () => {} } /> )
        .querySelector( 'input' );

    expect( input.getAttribute( 'role' ) ).toBe( 'switch' );
    expect( input.getAttribute( 'aria-label' ) ).toBe( 'Customize tokens' );
    expect( input.closest( 'label' ).hasAttribute( 'aria-label' ) ).toBe( false );
} );

test( 'a toggle row names its switch by its title', () => {
    const input = mount( <ToggleRow title="Hide header" checked onChange={ () => {} } /> ).querySelector( 'input' );

    expect( input.getAttribute( 'role' ) ).toBe( 'switch' );
    expect( input.getAttribute( 'aria-label' ) ).toBe( 'Hide header' );
} );

test( 'toggles from the input', () => {
    const seen = [];
    const input = mount( <Switch label="Customize tokens" checked={ false } onChange={ ( v ) => seen.push( v ) } /> )
        .querySelector( 'input' );

    act( () => input.click() );

    expect( seen ).toEqual( [ true ] );
} );
