module.exports = {
    "extends": "./node_modules/eslint-config-google/index.js",
    "parserOptions": {
        "ecmaVersion": 2017
    },
    "rules": {
        "object-curly-spacing": 'off',
        "no-const-assign": "warn",
        "linebreak-style": 'off',
        "max-len": 'off',
        "require-jsdoc": 'off',
        "indent": ["error", "tab"],
        "no-tabs": 'off',
        "no-unreachable": 'error',
        "no-multi-spaces": 'off'
    }
};