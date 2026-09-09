import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
    AreaChart, Area, Line, CartesianGrid, ResponsiveContainer,
    Tooltip, XAxis, YAxis,
} from 'recharts';

import { formatAmount, formatDate } from '../utils/format';

/**
 * Revenue line/area chart, Recharts-based. Replaces the hand-rolled SVG.
 *
 * - Current period: solid green area
 * - Previous period (when comparison toggled): dashed gray line, same scale
 * - Native hover tooltip + crosshair (mouse and keyboard accessible)
 */
export default function RevenueChart( { series = [], currency, compareOn, comparison } ) {
    // Hooks must run on every render: this widget mounts with an empty series
    // (loading) then re-renders with data, so useMemo has to sit above the
    // empty-guard or the hook count changes between renders and React throws.
    const prev = compareOn && comparison?.previous_series?.length === series.length
        ? comparison.previous_series
        : null;

    // Recharts needs one row per X point.
    const data = useMemo( () => ( series || [] ).map( ( p, i ) => ( {
        date:    p.date,
        current: p.amount_cents,
        prior:   prev ? prev[ i ].amount_cents : null,
    } ) ), [ series, prev ] );

    if ( ! series || series.length === 0 ) {
        return <div className="gratora-chart-empty">{ __( 'No data yet.', 'gratora-fundraising-campaigns' ) }</div>;
    }

    const fmtY = ( v ) => formatAmount( v, currency );
    const fmtX = ( v ) => String( v ).slice( 5 ); // MM-DD

    return (
        <div className="gratora-recharts">
            <ResponsiveContainer width="100%" height={ 280 }>
                <AreaChart data={ data } margin={ { top: 12, right: 12, bottom: 0, left: 0 } }>
                    <defs>
                        <linearGradient id="gratora-rev-grad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%"   stopColor="#6f5ce6" stopOpacity={ 0.22 } />
                            <stop offset="100%" stopColor="#6f5ce6" stopOpacity={ 0 } />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#eef0f2" strokeDasharray="2 4" vertical={ false } />
                    <XAxis
                        dataKey="date"
                        tickFormatter={ fmtX }
                        stroke="#9ca3af"
                        tickLine={ false }
                        axisLine={ false }
                        fontSize={ 11 }
                        interval="preserveStartEnd"
                        minTickGap={ 40 }
                    />
                    <YAxis
                        tickFormatter={ fmtY }
                        stroke="#9ca3af"
                        tickLine={ false }
                        axisLine={ false }
                        fontSize={ 11 }
                        width={ 70 }
                    />
                    <Tooltip
                        cursor={ { stroke: '#d1d5db', strokeWidth: 1 } }
                        contentStyle={ {
                            background:   '#111827',
                            border:       0,
                            borderRadius: 6,
                            color:        '#fff',
                            fontSize:     12,
                            padding:      '8px 10px',
                        } }
                        labelStyle={ { color: '#d1d5db', fontSize: 11, marginBottom: 2 } }
                        itemStyle={ { color: '#fff' } }
                        labelFormatter={ ( d ) => formatDate( d ) }
                        formatter={ ( value, name ) => [
                            formatAmount( value || 0, currency ),
                            name === 'current' ? __( 'Current', 'gratora-fundraising-campaigns' ) : __( 'Previous', 'gratora-fundraising-campaigns' ),
                        ] }
                    />
                    <Area
                        type="monotone"
                        dataKey="current"
                        stroke="#6f5ce6"
                        strokeWidth={ 2 }
                        fill="url(#gratora-rev-grad)"
                        isAnimationActive={ false }
                    />
                    { prev && (
                        <Line
                            type="monotone"
                            dataKey="prior"
                            stroke="#9ca3af"
                            strokeWidth={ 1.5 }
                            strokeDasharray="4 4"
                            dot={ false }
                            isAnimationActive={ false }
                        />
                    ) }
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
