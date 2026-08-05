const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = tseslint.config({
    files: ['**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended, prettierRecommended],
    rules: {
        'no-prototype-builtins': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'prettier/prettier': [
            'error',
            {
                trailingComma: 'es5',
                tabWidth: 4,
                semi: true,
                singleQuote: true,
                printWidth: 120,
            },
        ],
    },
});
