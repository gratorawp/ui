/**
 * Masked numeric input with a currency prefix. Formats on blur; accepts free
 * typing while focused. Respects org number-format settings (decimal places,
 * separators, symbol position). Pass `numberFormat` to override explicitly.
 */

import { useEffect, useState } from '@wordpress/element';

import { currencySymbol } from '../utils/currency';
import { numberFormat as orgNumberFormat, groupDigits, currencyDecimals } from '../utils/format';

export default function AmountInput( {
    value,
    onChange,
    currency       = 'USD',
    numberFormat,
    format,
    decimalPlaces,
    min,
    max,
    placeholder,
    autoFocus      = false,
    disabled       = false,
    className      = '',
    symbolOnly     = false,
    inputProps     = {},
} ) {
    // `format="us"/"eu"` is a legacy shortcut; resolve it to `numberFormat` shape.
    const shorthand = format === 'eu'
        ? { decimalSep: ',', thousandSep: '.', symbolPosition: 'after' }
        : ( format === 'us' ? { decimalSep: '.', thousandSep: ',', symbolPosition: 'before' } : null );

    const fmt = numberFormat
        ? { ...orgNumberFormat(), ...numberFormat }
        : ( shorthand ? { ...orgNumberFormat(), ...shorthand } : orgNumberFormat() );
    // How many decimals a currency has is a fact about the currency, not a
    // display preference. Taking it from the org number format meant an org
    // set to no cents stripped the separator out of a typed 25.50 and read
    // the result as 2550. The format still governs separators and symbol.
    const dp  = typeof decimalPlaces === 'number' ? decimalPlaces : currencyDecimals( currency );
    const symbol = currencySymbol( currency );

    const formatValue = ( v ) => {
        if ( v === '' || v === null || v === undefined || Number( v ) === 0 ) return '';
        return groupDigits( v, fmt.thousandSep, fmt.decimalSep, dp );
    };

    const [ text, setText ]       = useState( () => formatValue( value ) );
    const [ focused, setFocused ] = useState( false );

    useEffect( () => {
        if ( ! focused ) setText( formatValue( value ) );
    }, [ value, dp, fmt.thousandSep, fmt.decimalSep, focused ] );

    const emit = ( raw ) => {
        let n = parseInput( raw );
        if ( typeof min === 'number' && n < min ) n = min;
        if ( typeof max === 'number' && n > max ) n = max;
        onChange && onChange( n );
    };

    const handleChange = ( e ) => {
        const allowed = dp > 0 ? /[^\d,.]/g : /[^\d]/g;
        const cleaned = e.target.value.replace( allowed, '' );
        setText( cleaned );
        emit( cleaned );
    };

    const handleBlur = () => {
        setFocused( false );
        setText( formatValue( value ) );
    };

    return (
        <div className={ `gratora-amount${ disabled ? ' is-disabled' : '' } ${ className }`.trim() }>
            <span className="gratora-amount__prefix" aria-hidden="true">
                { ! symbolOnly && <span className="gratora-amount__code">{ currency }</span> }
                <span className="gratora-amount__symbol">{ symbol }</span>
            </span>
            <input
                type="text"
                inputMode={ dp > 0 ? 'decimal' : 'numeric' }
                className="gratora-amount__input"
                value={ text }
                onChange={ handleChange }
                onFocus={ () => setFocused( true ) }
                onBlur={ handleBlur }
                placeholder={ placeholder }
                autoFocus={ autoFocus }
                disabled={ disabled }
                { ...inputProps }
            />
        </div>
    );
}

function parseInput( raw ) {
    if ( typeof raw !== 'string' || raw === '' ) return 0;
    const cleaned = raw.replace( /[^\d,.\-]/g, '' );
    if ( cleaned === '' ) return 0;
    const lastDot   = cleaned.lastIndexOf( '.' );
    const lastComma = cleaned.lastIndexOf( ',' );
    const decimalAt = Math.max( lastDot, lastComma );
    let intPart, fracPart;
    if ( decimalAt < 0 ) {
        intPart  = cleaned;
        fracPart = '';
    } else {
        intPart  = cleaned.slice( 0, decimalAt ).replace( /[.,]/g, '' );
        fracPart = cleaned.slice( decimalAt + 1 ).replace( /[.,]/g, '' );
    }
    const sign = intPart.startsWith( '-' ) ? '-' : '';
    intPart = intPart.replace( /-/g, '' );
    const n = Number( `${ sign }${ intPart || '0' }${ fracPart ? '.' + fracPart : '' }` );
    return Number.isFinite( n ) ? n : 0;
}
