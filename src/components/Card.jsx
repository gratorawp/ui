/**
 * Card chrome. Props:
 *   leading     node           - rendered before the title block (e.g. <BrandMark />)
 *   title       string         - card title (left of head)
 *   sub         string         - small muted line under title
 *   meta        node           - text or pill on the right of head
 *   edited      bool | number  - true = "Edited" pill; number = "N change(s)" pill
 *   foot        node           - rendered inside .gratora-card__foot
 *   children    node           - body content
 *   collapsible bool           - head toggles the body; `meta` stays visible when closed
 *   defaultOpen bool           - uncontrolled starting state (default closed)
 *   open        bool           - controlled state; pair with onToggle
 *   onToggle    fn(next)       - called with the state the card is moving to
 *
 * A collapsible head is a single button, so `leading`, `meta` and `edited` must
 * stay non-interactive. Anything clickable belongs in the body or foot.
 */
import { useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { ChevronDown } from 'lucide-react';

export default function Card( {
    leading,
    title,
    sub,
    meta,
    edited,
    foot,
    children,
    collapsible = false,
    defaultOpen = false,
    open: controlledOpen,
    onToggle,
} ) {
    const isControlled = controlledOpen !== undefined;
    const [ uncontrolled, setUncontrolled ] = useState( !! defaultOpen );
    const isOpen = ! collapsible || ( isControlled ? !! controlledOpen : uncontrolled );

    const toggle = () => {
        if ( ! isControlled ) setUncontrolled( ! isOpen );
        if ( onToggle ) onToggle( ! isOpen );
    };

    const showHead = leading || title || meta || edited;

    const headInner = (
        <>
            <div className="gratora-card__head-left">
                { leading }
                { title && (
                    <div>
                        <h3 className="gratora-card__title">{ title }</h3>
                        { sub && <div className="gratora-card__sub">{ sub }</div> }
                    </div>
                ) }
                { typeof edited === 'number' && edited > 0 && (
                    <span className="gratora-edited-pill">
                        { sprintf(
                            /* translators: %d: number of edited fields in this card */
                            _n( '%d change', '%d changes', edited, 'gratora-fundraising-campaigns' ),
                            edited,
                        ) }
                    </span>
                ) }
                { edited === true && (
                    <span className="gratora-edited-pill">{ __( 'Edited', 'gratora-fundraising-campaigns' ) }</span>
                ) }
            </div>
            { meta && <span className="gratora-card__meta">{ meta }</span> }
            { collapsible && (
                <ChevronDown
                    size={ 16 }
                    strokeWidth={ 2 }
                    className="gratora-card__chevron"
                    aria-hidden="true"
                />
            ) }
        </>
    );

    const cls = collapsible
        ? `gratora-card gratora-card--collapsible ${ isOpen ? 'is-open' : 'is-closed' }`
        : 'gratora-card';

    return (
        <div className={ cls }>
            { showHead && ( collapsible ? (
                <button
                    type="button"
                    className="gratora-card__head gratora-card__head--toggle"
                    aria-expanded={ isOpen }
                    onClick={ toggle }
                >
                    { headInner }
                </button>
            ) : (
                <div className="gratora-card__head">{ headInner }</div>
            ) ) }
            { isOpen && <div className="gratora-card__body">{ children }</div> }
            { isOpen && foot && <div className="gratora-card__foot">{ foot }</div> }
        </div>
    );
}
