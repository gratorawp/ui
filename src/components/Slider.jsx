/**
 * Slider: numeric range + paired number + optional unit (with optional
 * dropdown when multiple units are allowed).
 *
 * Fixed unit:
 *   <Slider label="Border width" value={ w } onChange={ setW } unit="px" />
 *
 * Selectable unit:
 *   <Slider
 *       label="Gap"
 *       value={ gap }
 *       onChange={ setGap }
 *       unit={ gapUnit }
 *       units={ [ 'px', 'em', 'rem', '%' ] }
 *       onUnitChange={ setGapUnit }
 *   />
 */

import { useEffect, useId, useRef, useState } from '@wordpress/element';

export default function Slider( {
    label,
    help,
    value = 0,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    unit,
    units,
    onUnitChange,
    disabled = false,
} ) {
    const id = useId();
    const inputId = `gratora-slider-${ id }`;
    const num = Number.isFinite( Number( value ) ) ? Number( value ) : 0;
    const emit = ( v ) => onChange && onChange( Number( v ) );

    const hasUnitMenu =
        Array.isArray( units ) &&
        units.length > 1 &&
        typeof onUnitChange === 'function';
    const [ unitOpen, setUnitOpen ] = useState( false );
    const unitCellRef = useRef( null );

    useEffect( () => {
        if ( ! unitOpen ) return;
        const onDocPointer = ( e ) => {
            if ( ! unitCellRef.current?.contains( e.target ) ) {
                setUnitOpen( false );
            }
        };
        const onKey = ( e ) => { if ( e.key === 'Escape' ) setUnitOpen( false ); };
        document.addEventListener( 'mousedown', onDocPointer );
        document.addEventListener( 'keydown', onKey );
        return () => {
            document.removeEventListener( 'mousedown', onDocPointer );
            document.removeEventListener( 'keydown', onKey );
        };
    }, [ unitOpen ] );

    return (
        <div className="gratora-slider">
            { label && (
                <label htmlFor={ inputId } className="gratora-slider__label">
                    { label }
                </label>
            ) }
            <div className="gratora-slider__shell" ref={ unitCellRef }>
                <div className="gratora-slider__row">
                    <input
                        id={ inputId }
                        type="range"
                        className="gratora-slider__range"
                        min={ min }
                        max={ max }
                        step={ step }
                        value={ num }
                        onChange={ ( e ) => emit( e.target.value ) }
                        disabled={ disabled }
                    />
                    <div className="gratora-slider__num">
                        <input
                            type="number"
                            className="gratora-slider__input"
                            min={ min }
                            max={ max }
                            step={ step }
                            value={ num }
                            onChange={ ( e ) => emit( e.target.value ) }
                            disabled={ disabled }
                        />
                    </div>
                    { hasUnitMenu ? (
                        <div className="gratora-slider__unit-cell">
                            <button
                                type="button"
                                className={ `gratora-slider__unit-btn ${ unitOpen ? 'is-open' : '' }` }
                                onClick={ () => setUnitOpen( ! unitOpen ) }
                                aria-haspopup="listbox"
                                aria-expanded={ unitOpen }
                            >
                                { unit || units[ 0 ] }
                            </button>
                        </div>
                    ) : unit ? (
                        <div className="gratora-slider__unit">{ unit }</div>
                    ) : null }
                </div>
                { hasUnitMenu && unitOpen && (
                    <ul className="gratora-slider__unit-menu" role="listbox">
                        { units.map( ( u ) => (
                            <li key={ u }>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={ u === unit }
                                    className={ `gratora-slider__unit-option ${ u === unit ? 'is-on' : '' }` }
                                    onClick={ () => {
                                        onUnitChange( u );
                                        setUnitOpen( false );
                                    } }
                                >
                                    { u }
                                </button>
                            </li>
                        ) ) }
                    </ul>
                ) }
            </div>
            { help && <p className="gratora-slider__help">{ help }</p> }
        </div>
    );
}
