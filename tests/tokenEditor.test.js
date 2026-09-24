/**
 * A colour row offered a clear button whenever it showed a colour, so a row
 * showing the value it inherits, or the one its built-in ships, offered a
 * control that changed nothing.
 */

import { act } from 'react';
import { createRoot } from 'react-dom/client';

import ColorInput from '../src/components/ColorInput';
import TokenEditor from '../src/styling/TokenEditor';

jest.mock( '@wordpress/components', () => {
    const { createElement: h } = require( 'react' );

    return {
        __esModule:  true,
        Dropdown:    ( { renderToggle, renderContent } ) => h( 'div', null,
            renderToggle( { isOpen: false, onToggle: () => {} } ),
            renderContent()
        ),
        // Reports the colour it was opened on, as a picker nudged and put back does.
        ColorPicker: ( { color, onChange } ) => h( 'button', {
            type:      'button',
            className: 'picker-same',
            onClick:   () => onChange( color ),
        } ),
        PanelBody:     ( { children } ) => h( 'div', null, children ),
        Button:        ( { children, onClick, className } ) => h( 'button', { type: 'button', onClick, className }, children ),
        RangeControl:  () => null,
        SelectControl: () => null,
        TextControl:   () => null,
    };
} );

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const CATALOGUE = {
    'gratora-accent':    { group: 'brand', label: 'Accent', control: 'color', default: '#211d3f' },
    'gratora-text':      { group: 'brand', label: 'Body text', control: 'color', default: '#111827' },
    'gratora-button-bg': { group: 'brand', label: 'Button background', control: 'color', default: '' },
};

const GROUPS = { brand: 'Brand colors' };

let root = null;
let host = null;

function draw( node ) {
    if ( ! root ) {
        document.body.innerHTML = '<div id="root"></div>';
        host = document.getElementById( 'root' );
        act( () => { root = createRoot( host ); } );
    }
    act( () => root.render( node ) );

    return host;
}

afterEach( () => {
    act( () => root?.unmount() );
    root = null;
    document.body.innerHTML = '';
} );

const clears = () => host.querySelectorAll( '.gratora-color__clear' );
const click = ( el ) => act( () => el.click() );
const row = ( label ) => [ ...host.querySelectorAll( '.gratora-token-editor__row' ) ]
    .find( ( r ) => r.querySelector( '.gratora-token-editor__label' ).textContent === label );

function editor( props ) {
    return <TokenEditor catalogue={ CATALOGUE } groups={ GROUPS } onChange={ () => {} } { ...props } />;
}

test( 'a built-in row still at its shipped value offers nothing to clear', () => {
    const shipped = { 'gratora-accent': '#0F3D5C', 'gratora-button-bg': 'transparent' };

    draw( editor( {
        value:    shipped,
        base:     shipped,
        defaults: { 'gratora-accent': '#211d3f', 'gratora-text': '#111827', 'gratora-button-bg': '' },
    } ) );

    expect( clears() ).toHaveLength( 0 );
} );

test( 'on a campaign only the override offers to clear, and clearing it leaves nothing to clear', () => {
    const seen = [];
    const props = {
        value:    { 'gratora-accent': '#ff0000' },
        defaults: { 'gratora-accent': '#fde68a', 'gratora-text': '#111827', 'gratora-button-bg': '' },
        onChange: ( v ) => seen.push( v ),
    };

    draw( editor( props ) );
    expect( clears() ).toHaveLength( 1 );

    click( clears()[ 0 ] );
    expect( seen ).toEqual( [ {} ] );

    draw( editor( { ...props, value: seen[ 0 ] } ) );
    expect( clears() ).toHaveLength( 0 );
} );

test( 'a real change is still reported', () => {
    const seen = [];

    draw( editor( {
        value:    { 'gratora-accent': '#ff0000' },
        defaults: { 'gratora-accent': '#fde68a', 'gratora-text': '#111827', 'gratora-button-bg': '' },
        onChange: ( v ) => seen.push( v ),
    } ) );

    click( row( 'Accent' ).querySelector( '.gratora-token-editor__reset' ) );

    expect( seen ).toEqual( [ {} ] );
} );

describe( 'ColorInput', () => {
    test( 'clears by default', () => {
        draw( <ColorInput label="Line colour" value="#ff0000" onChange={ () => {} } /> );

        expect( clears() ).toHaveLength( 1 );
    } );

    test( 'offers no clear where the caller says clearing changes nothing', () => {
        draw( <ColorInput label="Line colour" value="#ff0000" clearable={ false } onChange={ () => {} } /> );

        expect( clears() ).toHaveLength( 0 );
    } );
} );
