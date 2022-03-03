module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['prettier', 'standard'],
  overrides: [
    {
      files: ['**/*.svelte'],
      processor: 'svelte3/svelte3',
      rules: {
        'import/first': 'off',
        'import/no-duplicates': 'off',
        'import/no-mutable-exports': 'off'
      }
    },
    {
      files: ['*.md'],
      parser: 'markdown-eslint-parser',
      rules: {
        'prettier/prettier': [
          'error',
          {
            parser: 'markdown'
          }
        ]
      }
    }
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    babelOptions: {
      plugins: ['@babel/plugin-syntax-top-level-await']
    },
    ecmaFeatures: {
      impliedStrict: true
    },
    ecmaVersion: 2021,
    requireConfigFile: false,
    sourceType: 'module'
  },
  plugins: ['svelte3', 'prettier', 'html', 'md'],
  rules: {
    'multiline-ternary': ['error'],
    'operator-linebreak': ['error', 'before'],
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1,
        maxBOF: 2,
        maxEOF: 0
      }
    ]
  }
}
