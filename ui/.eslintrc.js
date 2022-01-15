module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module',
  },
  plugins: [
    'vue',
  ],
  rules: {
    'vue/no-multiple-template-root': 'off',
    'import/no-relative-packages': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-side-effects-in-computed-properties': 'off',
    'operator-linebreak': ['error', 'none', { overrides: { '&&': 'ignore', '||': 'ignore' } }],
    'max-len': ['error', { code: 160 }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'import/no-dynamic-require': 'off',
    camelcase: ['off'],
    'no-param-reassign': ['error', { props: false }],
    'global-require': 'off',
    'no-console': 'off',
    'no-alert': 'off',
    'import/extensions': ['error', {
      vue: 'never',
    }],
    eqeqeq: ['error', 'smart'],
    'class-methods-use-this': 'off',
    'consistent-return': 'off',
    radix: ['error', 'as-needed'],
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', './ui/src'],
        ],
        extensions: ['.js', '.vue'],
      },
    },
  },
};
