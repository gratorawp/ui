/**
 * Section bar: h2 in accent green + small muted sub-line on the right.
 */
export default function SectionBar( { title, sub, right } ) {
    return (
        <div className="gratora-section-bar">
            <h2>{ title }</h2>
            { ( sub || right ) && (
                <div className="gratora-section-bar__sub">{ right || sub }</div>
            ) }
        </div>
    );
}
