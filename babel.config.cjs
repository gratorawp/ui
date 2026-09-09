// The package is "type": "module", so bundlers treat dist/*.js as fully
// specified ESM and reject extensionless relative imports. The source writes
// them extensionless, so name the file on the way out.
const addJsExtension = () => {
    const fix = ( node ) => {
        const s = node && node.source;
        if ( ! s || typeof s.value !== 'string' ) return;
        if ( ! s.value.startsWith( '.' ) ) return;
        if ( /\.[a-zA-Z0-9]+$/.test( s.value ) ) return;
        s.value = `${ s.value }.js`;
    };
    return {
        name: 'gratora-add-js-extension',
        visitor: {
            ImportDeclaration: ( p ) => fix( p.node ),
            ExportNamedDeclaration: ( p ) => fix( p.node ),
            ExportAllDeclaration: ( p ) => fix( p.node ),
        },
    };
};

module.exports = {
    // The preset consumers were applying anyway: automatic JSX runtime, ESM left
    // alone, so the output matches what their builds produced from source.
    presets: [ require.resolve( '@wordpress/babel-preset-default' ) ],
    plugins: [ addJsExtension ],
};
