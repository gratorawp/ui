/**
 * Two-column form row (label-left / field-right). Props:
 *   label     string - label text
 *   help      node   - small help line under the label
 *   fieldHelp node   - help text under the input
 *   required  bool   - shows a red asterisk
 *   wide      bool   - single-column layout (label on top)
 *   children  node   - input(s)
 */
export default function FormRow( { label, help, fieldHelp, required, wide, children } ) {
    return (
        <div className={ `gratora-form-row${ wide ? ' gratora-form-row--wide' : '' }` }>
            { label && (
                <div className="gratora-form-row__label">
                    { label }
                    { required && <span className="req">*</span> }
                    { help && <div className="gratora-form-row__help">{ help }</div> }
                </div>
            ) }
            <div className="gratora-form-row__field">
                { children }
                { fieldHelp && <div className="gratora-form-row__field-help">{ fieldHelp }</div> }
            </div>
        </div>
    );
}
