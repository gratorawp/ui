/**
 * Segmented: small pill group for picking one value from up to ~4 options.
 *
 * Options may be plain strings (label = value, capitalized via CSS) or
 * `{ value, label }` objects when the label differs from the stored value.
 *
 *   <Segmented value={ style } onChange={ setStyle }
 *       options={ [ 'none', 'solid', 'dashed', 'dotted' ] } />
 *
 *   <Segmented value={ align } onChange={ setAlign }
 *       options={ [
 *           { value: 'left',   label: 'Left' },
 *           { value: 'center', label: 'Center' },
 *           { value: 'right',  label: 'Right' },
 *       ] } />
 */

import Field from './Field';

export default function Segmented( { label, help, value, onChange, options = [], ariaLabel } ) {
    const buttons = (
        <div className="gratora-segmented" role="group" aria-label={ ariaLabel || label }>
            { options.map( ( o ) => {
                const optValue = typeof o === 'string' ? o : o.value;
                const optLabel = typeof o === 'string' ? o : o.label;
                const optIcon  = typeof o === 'string' ? null : o.icon;
                const isOn = value === optValue;
                return (
                    <button
                        key={ String( optValue ) }
                        type="button"
                        className={ `gratora-segmented__btn ${ isOn ? 'is-on' : '' }` }
                        aria-pressed={ isOn }
                        onClick={ () => onChange && onChange( optValue ) }
                    >
                        { optIcon }
                        { optLabel }
                    </button>
                );
            } ) }
        </div>
    );

    if ( ! label && ! help ) return buttons;
    return <Field label={ label } help={ help }>{ buttons }</Field>;
}
