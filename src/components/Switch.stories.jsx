import { useState } from '@wordpress/element';
import { Switch, ToggleRow } from './Switch';

export default {
  title: 'Components/Switch',
  component: Switch,
};

export const Toggle = {
  render: () => {
    const [ on, setOn ] = useState( true );
    return <Switch checked={ on } onChange={ setOn } label="Enable test mode" />;
  },
};

export const Row = {
  render: () => {
    const [ on, setOn ] = useState( false );
    return (
      <ToggleRow
        title="Anonymous donations"
        sub="Hide donor names on the public supporter wall"
        checked={ on }
        onChange={ setOn }
      />
    );
  },
};

export const Locked = {
  render: () => (
    <>
      <ToggleRow title="Default fund" sub="Promote another fund to move it" checked disabled />
      <ToggleRow title="Set a schedule" sub="The default fund stays open" checked={ false } disabled />
    </>
  ),
};
