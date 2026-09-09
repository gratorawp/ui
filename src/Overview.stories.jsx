/**
 * Imports the entire package barrel so the Storybook build compiles every
 * component — a fast smoke test that the migration is sound — and renders the
 * export surface for reference.
 */
import * as UI from './index';

export default {
  title: 'Overview/Package',
};

export const Exports = {
  render: () => {
    const names = Object.keys( UI ).sort();
    return (
      <div style={ { fontFamily: 'system-ui, sans-serif', maxWidth: 720 } }>
        <h2 style={ { margin: '0 0 4px' } }>@gratora/ui</h2>
        <p style={ { color: '#6b7280', margin: '0 0 16px' } }>
          { names.length } exports.
        </p>
        <div style={ { display: 'flex', flexWrap: 'wrap', gap: 6 } }>
          { names.map( ( n ) => (
            <code
              key={ n }
              style={ {
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: '2px 8px',
                fontSize: 12,
              } }
            >
              { n }
            </code>
          ) ) }
        </div>
      </div>
    );
  },
};

export const LiveSamples = {
  render: () => (
    <div style={ { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 } }>
      <UI.Btn variant="primary">Donate €25</UI.Btn>
      <UI.Notice status="success">Donation received.</UI.Notice>
      <UI.Card title="Annual Fund" sub="Active campaign">
        A live card rendered from the barrel export.
      </UI.Card>
      <UI.MetricCard label="Amount raised" value="€34,439" sub="Last 30 days" changePct={ 12 } />
      <UI.EmptyState title="No donations yet" body="They will show up here." />
    </div>
  ),
};
