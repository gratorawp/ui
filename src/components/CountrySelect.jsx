/**
 * CountrySelect: searchable country picker. Thin wrapper over SearchableSelect
 * with the shared COUNTRIES list pre-loaded. Use this anywhere the admin needs
 * to capture a country code.
 *
 *   <CountrySelect value={ code } onChange={ ( c ) => setCountry( c ) } />
 */

import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import SearchableSelect from './SearchableSelect';
import { COUNTRIES } from '../utils/countries';

export default function CountrySelect( { value, onChange, placeholder, disabled = false, className = '' } ) {
    const options = useMemo(
        () => COUNTRIES.map( ( c ) => ( { value: c.code, label: c.name, hint: c.code } ) ),
        []
    );
    return (
        <SearchableSelect
            value={ String( value || '' ).toUpperCase() }
            onChange={ onChange }
            options={ options }
            placeholder={ placeholder || __( 'Search country…', 'gratora-fundraising-campaigns' ) }
            disabled={ disabled }
            className={ className }
        />
    );
}
