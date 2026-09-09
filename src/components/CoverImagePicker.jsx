import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Opens the WP media library, restricted to images. Calls
 * onChange({ id, url }) on pick, onChange(null) on remove.
 */
function openMediaFrame( { onSelect, currentId } ) {
    if ( ! window.wp?.media ) {
        // eslint-disable-next-line no-alert
        alert( __( 'Media library not loaded.', 'gratora-fundraising-campaigns' ) );
        return;
    }
    const frame = window.wp.media( {
        title:    __( 'Select campaign cover image', 'gratora-fundraising-campaigns' ),
        button:   { text: __( 'Use this image', 'gratora-fundraising-campaigns' ) },
        library:  { type: 'image' },
        multiple: false,
    } );
    if ( currentId ) {
        frame.on( 'open', () => {
            const selection = frame.state().get( 'selection' );
            const attachment = window.wp.media.attachment( currentId );
            attachment.fetch();
            selection.reset( [ attachment ] );
        } );
    }
    frame.on( 'select', () => {
        const attachment = frame.state().get( 'selection' ).first().toJSON();
        const url = attachment.sizes?.large?.url || attachment.sizes?.full?.url || attachment.url;
        onSelect( { id: attachment.id, url } );
    } );
    frame.open();
}

export default function CoverImagePicker( { id, url, onChange } ) {
    const pick = () => openMediaFrame( {
        currentId: id,
        onSelect:  ( v ) => onChange( v ),
    } );

    if ( url ) {
        return (
            <div className="gratora-cover gratora-cover--filled">
                <img src={ url } alt="" />
                <div className="gratora-cover__actions">
                    <Button variant="secondary" onClick={ pick }>
                        { __( 'Replace', 'gratora-fundraising-campaigns' ) }
                    </Button>
                    <Button variant="tertiary" isDestructive onClick={ () => onChange( null ) }>
                        { __( 'Remove', 'gratora-fundraising-campaigns' ) }
                    </Button>
                </div>
            </div>
        );
    }
    return (
        <div className="gratora-cover" onClick={ pick } role="button" tabIndex={ 0 }
             onKeyDown={ ( e ) => ( e.key === 'Enter' || e.key === ' ' ) && pick() }>
            <div className="gratora-cover__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M11 16h2v-4.17l1.59 1.58L16 12l-4-4-4 4 1.41 1.41L11 11.83V16zm-7 4h16v-2H4v2zm0-16h16V2H4v2z" />
                </svg>
            </div>
            <Button variant="secondary" onClick={ ( e ) => { e.stopPropagation(); pick(); } }>
                { __( 'Select an image', 'gratora-fundraising-campaigns' ) }
            </Button>
            <div className="gratora-cover__hint">{ __( 'or click anywhere in this area', 'gratora-fundraising-campaigns' ) }</div>
        </div>
    );
}
