// .cjs because the package is "type": "module" and this config is CommonJS.
module.exports = {
    testEnvironment: 'jsdom',
    testMatch: [ '<rootDir>/tests/**/*.test.js' ],
};
