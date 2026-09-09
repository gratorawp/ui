import { useState } from '@wordpress/element';
import { Dropdown } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Month input that looks like a DateField and opens a year + month grid.
 * Backed by a "YYYY-MM" string.
 *
 * A day calendar is the wrong control for a value that has no day: it asks for
 * a precision the answer does not carry, and picking the 14th to mean March
 * reads as a mistake the next person has to work out.
 *
 * min/max bound both the grid and the year stepper, so a range with two years
 * of data cannot be browsed back a decade into empty months.
 *
 * Props:
 *   value      string        "YYYY-MM"
 *   onChange   (next) => void
 *   min        string        earliest selectable "YYYY-MM"
 *   max        string        latest selectable "YYYY-MM"
 *   ariaLabel  string
 */
export default function MonthField( { value, onChange, min, max, ariaLabel } ) {
    const parsed = parse( value );
    const [ year, setYear ] = useState( parsed ? parsed.year : new Date().getFullYear() );

    const months = monthNames();
    const label  = parsed
        ? sprintf(
            /* translators: 1: month name, 2: four-digit year. */
            __( '%1$s %2$s', 'gratora-fundraising-campaigns' ),
            months[ parsed.month - 1 ],
            String( parsed.year )
        )
        : '';

    const lo = parse( min );
    const hi = parse( max );

    const outOfRange = ( y, m ) => {
        const key = y * 12 + m;
        if ( lo && key < lo.year * 12 + lo.month ) return true;
        if ( hi && key > hi.year * 12 + hi.month ) return true;
        return false;
    };

    // A year with nothing selectable in it is a year not worth stepping to.
    const hasAnyMonth = ( y ) => months.some( ( _n, i ) => ! outOfRange( y, i + 1 ) );

    return (
        <Dropdown
            popoverProps={ { placement: 'bottom-start' } }
            onToggle={ ( open ) => {
                // Reopening after browsing to another year should start from
                // the selected month again, not wherever the last visit ended.
                if ( open && parsed ) setYear( parsed.year );
            } }
            renderToggle={ ( { isOpen, onToggle } ) => (
                <button
                    type="button"
                    className="gratora-input gratora-date-field"
                    onClick={ onToggle }
                    aria-expanded={ isOpen }
                    aria-haspopup="dialog"
                    aria-label={ ariaLabel }
                >
                    <span className={ `gratora-date-field__value${ label ? '' : ' is-empty' }` }>
                        { label || __( 'Select a month', 'gratora-fundraising-campaigns' ) }
                    </span>
                    <svg className="gratora-date-field__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                </button>
            ) }
            renderContent={ ( { onClose } ) => (
                <div className="gratora-date-field__popover gratora-month-field">
                    <div className="gratora-month-field__head">
                        <button
                            type="button"
                            className="gratora-month-field__nav"
                            onClick={ () => setYear( year - 1 ) }
                            disabled={ ! hasAnyMonth( year - 1 ) }
                            aria-label={ __( 'Previous year', 'gratora-fundraising-campaigns' ) }
                        >
                            ‹
                        </button>
                        <span className="gratora-month-field__year">{ year }</span>
                        <button
                            type="button"
                            className="gratora-month-field__nav"
                            onClick={ () => setYear( year + 1 ) }
                            disabled={ ! hasAnyMonth( year + 1 ) }
                            aria-label={ __( 'Next year', 'gratora-fundraising-campaigns' ) }
                        >
                            ›
                        </button>
                    </div>
                    <div className="gratora-month-field__grid">
                        { months.map( ( name, i ) => {
                            const m = i + 1;
                            const selected = parsed && parsed.year === year && parsed.month === m;
                            const disabled = outOfRange( year, m );

                            return (
                                <button
                                    key={ name }
                                    type="button"
                                    className={ `gratora-month-field__month${ selected ? ' is-selected' : '' }` }
                                    disabled={ disabled }
                                    aria-pressed={ !! selected }
                                    onClick={ () => {
                                        onChange( `${ year }-${ String( m ).padStart( 2, '0' ) }` );
                                        onClose();
                                    } }
                                >
                                    { shortMonth( name ) }
                                </button>
                            );
                        } ) }
                    </div>
                </div>
            ) }
        />
    );
}

function parse( value ) {
    const m = /^(\d{4})-(\d{2})$/.exec( String( value || '' ) );
    if ( ! m ) return null;

    const month = Number( m[ 2 ] );
    if ( month < 1 || month > 12 ) return null;

    return { year: Number( m[ 1 ] ), month };
}

/** Localised month names from the browser, matching the site's admin locale. */
function monthNames() {
    const locale = ( document.documentElement.lang || 'en' ).replace( '_', '-' );
    try {
        const fmt = new Intl.DateTimeFormat( locale, { month: 'long' } );
        return Array.from( { length: 12 }, ( _v, i ) => fmt.format( new Date( 2000, i, 1 ) ) );
    } catch ( e ) {
        return [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
        ];
    }
}

/** Three letters where the grid has room for three, whatever the language. */
function shortMonth( name ) {
    return name.length > 4 ? name.slice( 0, 3 ) : name;
}
