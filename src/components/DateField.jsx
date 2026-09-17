import { Dropdown, DatePicker, DateTimePicker, Button } from '@wordpress/components';
import { dateI18n } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import { parseTimestamp } from '../utils/format';

/**
 * Date (or date + time) input that looks like a .gratora-input and opens a WP
 * picker on click. Backed by an ISO string:
 *   - date only:   "YYYY-MM-DD"          (default)
 *   - with time:   "YYYY-MM-DD HH:MM:SS" (when withTime is true)
 *
 * The MySQL-friendly space separator is used for time-mode because that's what
 * `datetime` columns expect; for date-only we drop the time portion entirely.
 *
 * Props:
 *   value       string | null  ISO date or datetime
 *   onChange    (next) => void next is the same shape, or null
 *   withTime    bool           show time picker too (DateTimePicker)
 *   is12Hour    bool           passed to DateTimePicker; defaults to WP setting
 *   placeholder string         shown when value is empty
 *   ariaLabel   string         accessible label
 *   edited      bool           applies .gratora-input--edited
 *   className   string         extra classes on the trigger button
 *   format      string         WP date format token; defaults to site setting
 *   allowClear  bool           shows a Clear button under the picker
 */
export default function DateField( {
    value,
    onChange,
    withTime,
    is12Hour,
    placeholder,
    ariaLabel,
    edited,
    className = '',
    format,
    allowClear = true,
} ) {
    const settings = window.wp?.date?.getSettings?.() || null;
    const dateFmt  = format || settings?.formats?.date || 'M j, Y';
    const timeFmt  = settings?.formats?.time || 'H:i';
    const displayFmt = withTime ? `${ dateFmt } · ${ timeFmt }` : dateFmt;
    const displayValue = value
        ? dateI18n( displayFmt, withTime ? value : anchorNoon( value, settings ) )
        : '';

    const triggerClass = [
        'gratora-input',
        'gratora-date-field',
        edited && 'gratora-input--edited',
        className,
    ].filter( Boolean ).join( ' ' );

    const Picker = withTime ? DateTimePicker : DatePicker;

    return (
        <Dropdown
            popoverProps={ { placement: 'bottom-start' } }
            renderToggle={ ( { isOpen, onToggle } ) => (
                <button
                    type="button"
                    className={ triggerClass }
                    onClick={ onToggle }
                    aria-expanded={ isOpen }
                    aria-haspopup="dialog"
                    aria-label={ ariaLabel }
                >
                    <span className={ `gratora-date-field__value${ value ? '' : ' is-empty' }` }>
                        { displayValue || placeholder || ( withTime
                            ? __( 'Select date and time', 'gratora-fundraising-campaigns' )
                            : __( 'Select a date', 'gratora-fundraising-campaigns' ) ) }
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
                <div className="gratora-date-field__popover">
                    <Picker
                        currentDate={ value || undefined }
                        is12Hour={ is12Hour }
                        onChange={ ( next ) => {
                            onChange( normalise( next, withTime ) );
                            // Date-only: a click completes selection; time mode keeps the popover.
                            if ( ! withTime ) onClose();
                        } }
                    />
                    { allowClear && value && (
                        <Button
                            variant="tertiary"
                            onClick={ () => { onChange( null ); onClose(); } }
                            className="gratora-date-field__clear"
                        >
                            { withTime
                                ? __( 'Clear date and time', 'gratora-fundraising-campaigns' )
                                : __( 'Clear date', 'gratora-fundraising-campaigns' ) }
                        </Button>
                    ) }
                </div>
            ) }
        />
    );
}

/**
 * A date-only value is a calendar day, not an instant, but dateI18n resolves
 * one: it reads "2026-01-01" in the browser's timezone and renders it in the
 * site's, so a browser ahead of the site shows the day before. That is not a
 * cosmetic slip. "2026-01-01" displayed as "December 31, 2025" puts a donation
 * in the wrong year on a screen whose whole job is stating which day it was.
 *
 * Anchoring at noon in the SITE's timezone survives the round trip whatever
 * either offset is, because the render undoes exactly the shift applied here.
 */
function anchorNoon( value, settings ) {
    const at = parseTimestamp( String( value ).slice( 0, 10 ) );
    if ( Number.isNaN( at.getTime() ) ) return value;

    const offset = Number( settings?.timezone?.offset ?? 0 );

    return new Date( at.getTime() - offset * 3600000 );
}

function normalise( next, withTime ) {
    if ( ! next ) return null;
    const s = String( next );
    if ( ! withTime ) return s.slice( 0, 10 );
    // MySQL DATETIME format: replace "T" with a space and drop offset/ms.
    return s.slice( 0, 19 ).replace( 'T', ' ' );
}
