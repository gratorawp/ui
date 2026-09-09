/**
 * Form field wrapper: label, optional help text, optional footer (e.g. char counter).
 * Children is the input element(s).
 */
export default function Field( { label, help, footer, children } ) {
    return (
        <div className="gratora-field">
            { label && <div className="gratora-field__label">{ label }</div> }
            { help  && <div className="gratora-field__help">{ help }</div> }
            { children }
            { footer && <div className="gratora-field__footer">{ footer }</div> }
        </div>
    );
}
