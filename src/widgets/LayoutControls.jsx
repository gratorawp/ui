import { Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import { __, sprintf, _n } from '@wordpress/i18n';

import Icon from '../components/Icon';

/**
 * Section-bar dropdown that lists hidden widgets so the user can bring them
 * back, plus a Reset button.
 */
export default function LayoutControls( { hidden, registry, onUnhide, onReset } ) {
    return (
        <Dropdown
            popoverProps={ { placement: 'bottom-end' } }
            renderToggle={ ( { isOpen, onToggle } ) => (
                <button
                    type="button"
                    className={ `gratora-layout-toggle${ isOpen ? ' is-open' : '' }` }
                    onClick={ onToggle }
                    aria-expanded={ isOpen }
                >
                    <Icon name="layout-grid" size={ 14 } />
                    { hidden.length === 0
                        ? __( 'Customize', 'gratora-fundraising-campaigns' )
                        : sprintf(
                            /* translators: %d: number of hidden widgets */
                            _n( '%d hidden widget', '%d hidden widgets', hidden.length, 'gratora-fundraising-campaigns' ),
                            hidden.length
                        ) }
                </button>
            ) }
            renderContent={ ( { onClose } ) => (
                <>
                    { hidden.length > 0 && (
                        <MenuGroup label={ __( 'Show again', 'gratora-fundraising-campaigns' ) }>
                            { hidden.map( ( key ) => {
                                const label = registry[ key ]?.title || registry[ key ]?.label || key;
                                return (
                                    <MenuItem key={ key } onClick={ () => onUnhide( key ) }>
                                        { label }
                                    </MenuItem>
                                );
                            } ) }
                        </MenuGroup>
                    ) }
                    <MenuGroup>
                        <MenuItem
                            onClick={ () => { onReset(); onClose(); } }
                        >
                            { __( 'Reset layout', 'gratora-fundraising-campaigns' ) }
                        </MenuItem>
                    </MenuGroup>
                </>
            ) }
        />
    );
}
