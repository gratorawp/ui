/**
 * NumberWithUnit: small number input + unit menu, stored as a single CSS
 * string ("16px", "1.5rem", "100%").
 *
 * Splits the value into number + unit for editing and recomposes on change.
 * Default unit list covers the usual CSS suspects; pass `units` to override
 * (e.g. `[ 'px' ]` for a px-only sizing input).
 *
 *   <NumberWithUnit value={ pad } onChange={ setPad } units={ [ 'px', 'em', 'rem', '%' ] } />
 */

import { useId, useMemo } from '@wordpress/element';

const DEFAULT_UNITS = [ 'px', 'em', 'rem', '%', 'vh', 'vw' ];

export default function NumberWithUnit( {
    label,
    help,
    value = '',
    onChange,
    units = DEFAULT_UNITS,
    min,
    max,
    step = 1,
    disabled = false,
} ) {
    const id = useId();
    const inputId = `gratora-nu-${ id }`;
    const parsed  = useMemo( () => parseValue( String( value || '' ), units ), [ value, units ] );

    const emit = ( nextNum, nextUnit ) => {
        if ( ! onChange ) return;
        if ( nextNum === '' || nextNum === null ) {
            onChange( '' );
            return;
        }
        onChange( `${ nextNum }${ nextUnit || units[ 0 ] }` );
    };

    return (
        <div className="gratora-number-unit">
            { label && (
                <label htmlFor={ inputId } className="gratora-number-unit__label">{ label }</label>
            ) }
            <div className="gratora-number-unit__row">
                <input
                    id={ inputId }
                    type="number"
                    className="gratora-number-unit__num"
                    value={ parsed.num }
                    onChange={ ( e ) => emit( e.target.value, parsed.unit ) }
                    min={ min }
                    max={ max }
                    step={ step }
                    disabled={ disabled }
                />
                { units.length > 1 ? (
                    <select
                        className="gratora-number-unit__unit"
                        value={ parsed.unit }
                        onChange={ ( e ) => emit( parsed.num, e.target.value ) }
                        disabled={ disabled }
                        aria-label="Unit"
                    >
                        { units.map( ( u ) => <option key={ u } value={ u }>{ u }</option> ) }
                    </select>
                ) : (
                    <span className="gratora-number-unit__unit-static">{ units[ 0 ] }</span>
                ) }
            </div>
            { help && <p className="gratora-number-unit__help">{ help }</p> }
        </div>
    );
}

function parseValue( raw, units ) {
    const match = raw.trim().match( /^(-?[\d.]+)\s*([a-z%]*)$/i );
    if ( ! match ) return { num: '', unit: units[ 0 ] };
    const num  = match[ 1 ];
    const unit = match[ 2 ] && units.includes( match[ 2 ] ) ? match[ 2 ] : units[ 0 ];
    return { num, unit };
}
