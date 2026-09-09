import { useMemo, useState } from '@wordpress/element';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

import Widget, { WidgetCard } from './Widget';

/**
 * Sortable widget grid. Two flex columns; full-width widgets break sections;
 * half-width widgets deal by parity (index 0 = left, 1 = right, ...).
 */
export default function WidgetGrid( { visibleOrder, registry, onReorder, onHide } ) {
    const [ activeKey, setActiveKey ] = useState( null );

    const sensors = useSensors(
        useSensor( PointerSensor, { activationConstraint: { distance: 6 } } ),
        useSensor( KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates } )
    );

    const handleDragStart = ( event ) => {
        setActiveKey( event.active?.id ?? null );
    };

    const handleDragEnd = ( event ) => {
        setActiveKey( null );
        const { active, over } = event;
        if ( ! over || active.id === over.id ) return;
        const from = visibleOrder.indexOf( active.id );
        const to   = visibleOrder.indexOf( over.id );
        if ( from < 0 || to < 0 ) return;
        onReorder( from, to );
    };

    const handleDragCancel = () => setActiveKey( null );

    // Split visibleOrder into sections: each full-width widget gets its own
    // section; consecutive half-width widgets group into one section we'll
    // render as a two-column flex layout.
    const sections = useMemo( () => {
        const out = [];
        let half = [];
        for ( const key of visibleOrder ) {
            const span = registry[ key ]?.span || 'half';
            if ( span === 'full' ) {
                if ( half.length ) out.push( { type: 'half', keys: half } );
                out.push( { type: 'full', keys: [ key ] } );
                half = [];
            } else {
                half.push( key );
            }
        }
        if ( half.length ) out.push( { type: 'half', keys: half } );
        return out;
    }, [ visibleOrder, registry ] );

    const renderWidget = ( key ) => {
        const def = registry[ key ];
        if ( ! def ) return null;
        const i = visibleOrder.indexOf( key );
        const { render, span = 'half', title, headerExtras, bare = false } = def;
        return (
            <Widget
                key={ key }
                id={ key }
                span={ span }
                title={ title }
                headerExtras={ typeof headerExtras === 'function' ? headerExtras() : headerExtras }
                bare={ bare }
                onHide={ () => onHide( key ) }
                canMoveUp={ i > 0 }
                canMoveDown={ i < visibleOrder.length - 1 }
                onMoveUp={ () => onReorder( i, i - 1 ) }
                onMoveDown={ () => onReorder( i, i + 1 ) }
            >
                { render() }
            </Widget>
        );
    };

    const activeDef = activeKey ? registry[ activeKey ] : null;

    return (
        <DndContext
            sensors={ sensors }
            collisionDetection={ closestCenter }
            onDragStart={ handleDragStart }
            onDragEnd={ handleDragEnd }
            onDragCancel={ handleDragCancel }
        >
            <SortableContext items={ visibleOrder } strategy={ rectSortingStrategy }>
                <div className="gratora-widget-grid">
                    { sections.map( ( section, sIdx ) => {
                        if ( section.type === 'full' ) {
                            return renderWidget( section.keys[ 0 ] );
                        }
                        const leftKeys  = section.keys.filter( ( _, i ) => i % 2 === 0 );
                        const rightKeys = section.keys.filter( ( _, i ) => i % 2 === 1 );
                        return (
                            <div key={ `s-${ sIdx }` } className="gratora-widget-grid__halves">
                                <div className="gratora-widget-grid__col">
                                    { leftKeys.map( renderWidget ) }
                                </div>
                                <div className="gratora-widget-grid__col">
                                    { rightKeys.map( renderWidget ) }
                                </div>
                            </div>
                        );
                    } ) }
                </div>
            </SortableContext>

            { /* DragOverlay: floating clone with locked dimensions, outside normal layout flow. */ }
            <DragOverlay dropAnimation={ null }>
                { activeDef ? (
                    <WidgetCard
                        title={ activeDef.title }
                        headerExtras={ typeof activeDef.headerExtras === 'function'
                            ? activeDef.headerExtras() : activeDef.headerExtras }
                        isOverlay
                    >
                        { activeDef.render() }
                    </WidgetCard>
                ) : null }
            </DragOverlay>
        </DndContext>
    );
}
