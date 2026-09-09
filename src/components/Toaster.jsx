/**
 * Fixed-position toast stack. Mount once per admin React root; it renders
 * whatever the notify store holds and auto-dismisses on the store's timers.
 */

import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { subscribe, dismiss } from '../utils/notify';

function Glyph( { type } ) {
    const common = { width: 16, height: 16, viewBox: '0 0 16 16', 'aria-hidden': true };
    if ( type === 'success' ) {
        return <svg { ...common }><path d="M6.5 10.6 3.9 8l-1 1 3.6 3.6L13 6.1l-1-1z" fill="currentColor" /></svg>;
    }
    if ( type === 'error' ) {
        return <svg { ...common }><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.9 10.5h-1.8V9.7h1.8zm0-3.3h-1.8V4.5h1.8z" fill="currentColor" /></svg>;
    }
    if ( type === 'warning' ) {
        return <svg { ...common }><path d="M8 1.5 15 14H1zm.9 8.4V6.1H7.1v3.8zm0 3v-1.8H7.1v1.8z" fill="currentColor" /></svg>;
    }
    return <svg { ...common }><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.9 10.5H7.1V6.7h1.8zm0-6.3H7.1V3.4h1.8z" fill="currentColor" /></svg>;
}

export default function Toaster() {
    const [ items, setItems ] = useState( [] );

    useEffect( () => subscribe( setItems ), [] );

    if ( ! items.length ) return null;

    return (
        <div className="gratora-toaster" role="region" aria-label={ __( 'Notifications', 'gratora-fundraising-campaigns' ) }>
            { items.map( ( t ) => (
                <div
                    key={ t.id }
                    className={ `gratora-toast gratora-toast--${ t.type }` }
                    role={ t.type === 'error' || t.type === 'warning' ? 'alert' : 'status' }
                >
                    <span className="gratora-toast__icon"><Glyph type={ t.type } /></span>
                    <span className="gratora-toast__msg">{ t.message }</span>
                    { t.action && (
                        <button
                            type="button"
                            className="gratora-toast__action"
                            onClick={ () => { t.action.onClick && t.action.onClick(); dismiss( t.id ); } }
                        >
                            { t.action.label }
                        </button>
                    ) }
                    <button
                        type="button"
                        className="gratora-toast__close"
                        aria-label={ __( 'Dismiss', 'gratora-fundraising-campaigns' ) }
                        onClick={ () => dismiss( t.id ) }
                    >
                        ×
                    </button>
                </div>
            ) ) }
        </div>
    );
}
