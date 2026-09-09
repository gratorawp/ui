/**
 * Two-column section card. Left: title + description. Right: form fields.
 */
export default function SettingsSection( { title, description, children } ) {
    return (
        <div className="gratora-section">
            <div className="gratora-section__intro">
                <h3 className="gratora-section__title">{ title }</h3>
                { description && <p className="gratora-section__desc">{ description }</p> }
            </div>
            <div className="gratora-section__body">
                { children }
            </div>
        </div>
    );
}
