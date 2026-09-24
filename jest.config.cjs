// .cjs because the package is "type": "module" and this config is CommonJS.
module.exports = {
    testEnvironment: 'jsdom',
    testMatch: [ '<rootDir>/tests/**/*.test.js' ],
    // babel.config.cjs names .js on every relative import for the build, and
    // the components are .jsx, so the name is resolved without it.
    moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
};
