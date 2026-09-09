/**
 * Plain button. Variant via prop:
 *   <Btn variant="primary">Save</Btn>
 *   <Btn variant="ghost" size="sm">Reset</Btn>
 *
 * Accepts href to render an anchor styled like a button.
 */
export default function Btn( {
    variant,
    size,
    href,
    onClick,
    disabled,
    isBusy,
    className = '',
    children,
    ...rest
} ) {
    const classes = [
        'gratora-btn',
        variant && `gratora-btn--${ variant }`,
        size && `gratora-btn--${ size }`,
        className,
    ].filter( Boolean ).join( ' ' );

    if ( href ) {
        return (
            <a className={ classes } href={ href } { ...rest }>
                { children }
            </a>
        );
    }
    return (
        <button
            type="button"
            className={ classes }
            onClick={ onClick }
            disabled={ !! disabled || !! isBusy }
            { ...rest }
        >
            { children }
        </button>
    );
}
