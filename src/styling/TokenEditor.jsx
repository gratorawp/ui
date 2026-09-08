/**
 * Full token-map editor. Renders tokens grouped into collapsible panels;
 * each shows the effective value (override or default) with a Reset link.
 *
 * Pure / prop-driven: pass `catalogue`, `groups`, and `defaults` explicitly.
 * The FundKit plugin sources these from window.fundkit.styling and passes them in.
 *
 * `base` is the layer beneath `value` when `value` carries that layer too, as a
 * brand preset's token map does. A key equal to its base is not an override, so
 * it offers no Reset, and Reset restores the base value rather than dropping to
 * the catalogue default.
 */

import { PanelBody, RangeControl, SelectControl, TextControl, Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import ColorInput from '../components/ColorInput';

export default function TokenEditor( {
    value = {},
    defaults = {},
    base = {},
    onChange,
    catalogue = {},
    groups = {},
} ) {
    const byGroup = {};
    for ( const [ key, def ] of Object.entries( catalogue ) ) {
        const g = def.group || 'other';
        ( byGroup[ g ] ||= [] ).push( { key, def } );
    }

    const orderedGroups = Object.keys( groups ).filter( ( g ) => byGroup[ g ]?.length );
    for ( const g of Object.keys( byGroup ) ) {
        if ( ! orderedGroups.includes( g ) ) orderedGroups.push( g );
    }

    const clearToken = ( out, key ) => {
        if ( base[ key ] !== undefined ) {
            out[ key ] = base[ key ];
        } else {
            delete out[ key ];
        }
    };

    const setToken = ( key, next, def ) => {
        const out = { ...value };
        if ( next === '' || next == null || same( next, defaults[ key ], def ) ) {
            clearToken( out, key );
        } else {
            out[ key ] = String( next );
        }
        onChange( out );
    };

    const resetToken = ( key ) => {
        const out = { ...value };
        clearToken( out, key );
        onChange( out );
    };

    return (
        <div className="fundkit-token-editor">
            { orderedGroups.map( ( g, gi ) => (
                <PanelBody
                    key={ g }
                    title={ groups[ g ] || g }
                    initialOpen={ gi === 0 }
                >
                    { byGroup[ g ].map( ( { key, def } ) => (
                        <TokenRow
                            key={ key }
                            tokenKey={ key }
                            def={ def }
                            current={ value[ key ] ?? defaults[ key ] ?? '' }
                            isOverridden={ value[ key ] !== undefined && ! same( value[ key ], base[ key ], def ) }
                            onChange={ ( v ) => setToken( key, v, def ) }
                            onReset={ () => resetToken( key ) }
                        />
                    ) ) }
                </PanelBody>
            ) ) }
        </div>
    );
}

/**
 * A hex colour means the same thing in either case, and the built-ins ship it
 * uppercase where the colour control writes it lowercase. Everything else is
 * compared as stored: a font stack's case is the author's.
 */
function same( a, b, def ) {
    if ( def?.control !== 'color' ) return a === b;

    return String( a ?? '' ).toLowerCase() === String( b ?? '' ).toLowerCase();
}

function TokenRow( { tokenKey, def, current, isOverridden, onChange, onReset } ) {
    const label = def.label || tokenKey;
    return (
        <div className="fundkit-token-editor__row">
            <div className="fundkit-token-editor__row-head">
                <span className="fundkit-token-editor__label">{ label }</span>
                { isOverridden && (
                    <Button
                        variant="link"
                        size="small"
                        className="fundkit-token-editor__reset"
                        onClick={ onReset }
                    >
                        { __( 'Reset', 'fundkit-fundraising-campaigns' ) }
                    </Button>
                ) }
            </div>
            <TokenControl
                tokenKey={ tokenKey }
                def={ def }
                value={ current }
                onChange={ onChange }
            />
            { def.help && <p className="fundkit-token-editor__help">{ def.help }</p> }
        </div>
    );
}

function TokenControl( { def, value, onChange } ) {
    switch ( def.control ) {
        case 'color':
            return <ColorInput value={ value } onChange={ onChange } label={ def.label } />;

        case 'range': {
            const literal = String( value ?? '' ).trim();
            const min = def.min ?? 0;
            const max = def.max ?? 32;

            if ( literal !== '' && ! slidable( literal, min, max ) ) {
                return (
                    <TextControl
                        value={ literal }
                        onChange={ onChange }
                        help={ sprintf(
                            /* translators: 1: smallest pixel size the slider offers, 2: the largest */
                            __( 'The slider reads whole pixels from %1$spx to %2$spx. Type a size in that range to use it.', 'fundkit-fundraising-campaigns' ),
                            min,
                            max
                        ) }
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                    />
                );
            }

            return (
                <RangeControl
                    value={ literal === '' ? 0 : parseFloat( literal ) }
                    onChange={ ( v ) => onChange( `${ v ?? 0 }px` ) }
                    min={ min }
                    max={ max }
                    step={ def.step ?? 1 }
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />
            );
        }

        case 'select': {
            const options = Object.entries( def.options || {} ).map( ( [ v, label ] ) => ( {
                value: v,
                label,
            } ) );
            return (
                <SelectControl
                    value={ value }
                    options={ options }
                    onChange={ onChange }
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />
            );
        }

        case 'font':
            return (
                <TextControl
                    value={ value }
                    onChange={ onChange }
                    placeholder={ def.default || '' }
                    help={ __( 'CSS font-family stack. e.g. Inter, system-ui, sans-serif.', 'fundkit-fundraising-campaigns' ) }
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />
            );

        default:
            return (
                <TextControl
                    value={ value }
                    onChange={ onChange }
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />
            );
    }
}

/**
 * Whether the slider can hold this value and give it back unchanged. Shared so
 * anything that wants to say a value is unshown asks the same question the
 * control asks.
 *
 * @param {string} literal the stored value
 * @param {number} min     the slider's floor
 * @param {number} max     the slider's ceiling
 * @return {boolean} true when the slider represents it exactly.
 */
export function slidable( literal, min = 0, max = 32 ) {
    const m = /^(-?\d+(?:\.\d+)?)px$/.exec( String( literal ?? '' ).trim() );
    if ( ! m ) return false;
    const n = parseFloat( m[ 1 ] );

    return n >= min && n <= max;
}
