/**
 * Centered modal dialog. Chrome only - callers supply body (children) and
 * footer actions. For larger editing surfaces use Drawer instead.
 *
 * Props:
 *   title    string - heading (left of head)
 *   onClose  fn      - overlay click, the close button and Escape call this
 *   size     string  - 'wide' for an editing surface (720px); default is 520px
 *   foot     node    - rendered in .gratora-dialog__foot (optional)
 *   children node    - body content
 */
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

export default function Dialog( { title, onClose, size, foot, children } ) {
    useEffect( () => {
        const onKey = ( e ) => { if ( e.key === 'Escape' && onClose ) onClose(); };
        document.addEventListener( 'keydown', onKey );
        return () => document.removeEventListener( 'keydown', onKey );
    }, [ onClose ] );

    return (
        // The overlay is backdrop chrome, so it takes a presentation role and
        // closes only on a click that landed on itself. Keyboard users close
        // with Escape, handled above.
        <div
            className="gratora-dialog-overlay"
            role="presentation"
            onClick={ ( e ) => { if ( e.target === e.currentTarget && onClose ) onClose(); } }
        >
            <div
                className={ `gratora-dialog${ size ? ` gratora-dialog--${ size }` : '' }` }
                role="dialog"
                aria-modal="true"
                aria-label={ title }
            >
                <div className="gratora-dialog__head">
                    <h2>{ title }</h2>
                    <button
                        type="button"
                        className="gratora-dialog__close"
                        onClick={ onClose }
                        aria-label={ __( 'Close', 'gratora-fundraising-campaigns' ) }
                    >
                        ✕
                    </button>
                </div>

                <div className="gratora-dialog__body">{ children }</div>

                { foot && <div className="gratora-dialog__foot">{ foot }</div> }
            </div>
        </div>
    );
}
