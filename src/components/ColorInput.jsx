/**
 * Shared color input. Renders a swatch + hex label that opens the WP
 * ColorPicker in a popover when clicked, beside a button that empties it.
 */

import { ColorPicker, Dropdown } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import Icon from './Icon';

export default function ColorInput( { value, onChange, label } ) {
    const current = String( value || '' );

    return (
        <Dropdown
            contentClassName="gratora-color-picker-popover"
            popoverProps={ { placement: 'bottom-start' } }
            renderToggle={ ( { isOpen, onToggle } ) => (
                <span className="gratora-color-control">
                    <button
                        type="button"
                        className="gratora-color"
                        onClick={ onToggle }
                        aria-expanded={ isOpen }
                        aria-label={ label || current || __( 'Pick a color', 'gratora-fundraising-campaigns' ) }
                    >
                        <span
                            className="gratora-color__swatch"
                            style={ { background: current || 'transparent' } }
                            aria-hidden="true"
                        />
                        { current && (
                            <span className="gratora-color__hex">
                                { current.toUpperCase() }
                            </span>
                        ) }
                    </button>
                    { current && (
                        <button
                            type="button"
                            className="gratora-color__clear"
                            onClick={ () => onChange( '' ) }
                            aria-label={ label
                                ? sprintf(
                                    /* translators: %s: what the colour is for, e.g. Button background */
                                    __( 'Clear %s', 'gratora-fundraising-campaigns' ),
                                    label
                                )
                                : __( 'Clear color', 'gratora-fundraising-campaigns' ) }
                        >
                            <Icon name="close" size={ 14 } aria-hidden="true" />
                        </button>
                    ) }
                </span>
            ) }
            renderContent={ () => (
                <ColorPicker
                    color={ current }
                    onChange={ ( next ) => onChange( normalizeColor( next ) ) }
                    enableAlpha={ false }
                    copyFormat="hex"
                />
            ) }
        />
    );
}

// Normalize ColorPicker onChange to a hex string (WP versions differ in payload shape).
function normalizeColor( v ) {
    if ( typeof v === 'string' ) return v;
    if ( v && typeof v === 'object' ) {
        if ( typeof v.hex === 'string' ) return v.hex;
        if ( v.color && typeof v.color === 'object' && typeof v.color.toHexString === 'function' ) {
            return v.color.toHexString();
        }
    }
    return '';
}
