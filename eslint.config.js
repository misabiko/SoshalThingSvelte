import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginHtml from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';
import eslintPluginSvelte from 'eslint-plugin-svelte';

const ignores = [
	'**/dist/',
	'**/dist*/',
	'**/node_modules/',
	'chrome extension/dist/'
];

export default tseslint.config(
	{
		extends: [
			...eslintPluginSvelte.configs['flat/recommended'],
			pluginJs.configs.recommended,
			...tseslint.configs.strict,
			...tseslint.configs.stylistic,
		//TODO "plugin:svelte/recommended"
		],
		files: ['**/*.{js,mjs,cjs,ts}'],
		ignores,
		languageOptions: {
			globals: {
				...globals.browser,
				// Bun: 'readonly',
				// process: 'readonly',
			},
		},
		plugins: {
			'@stylistic': stylistic,
		},
		rules: {
			//Wish I could disable semicolon for class member fields
			'@stylistic/semi': ['error', 'always'],
			'@stylistic/member-delimiter-style': [
				'warn',
				{
					multiline: {
						delimiter: 'none',
						requireLast: true
					},
					singleline: {
						delimiter: 'comma',
						requireLast: false
					}
				}
			],
			'@stylistic/quotes': [
				'warn',
				'single',
				{
					avoidEscape: true
				}
			],
			'@stylistic/quote-props': ['warn', 'as-needed'],
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_'
				}
			],
			'svelte/require-store-reactive-access': 'error',
			'svelte/html-quotes': ['warn', {
				prefer: 'single',
				dynamic: {
					quoted: false,
					avoidInvalidUnquotedInHTML: true
				}
			}],
			'prefer-const': ['warn', {
				destructuring: 'all',
			}],
			'@typescript-eslint/no-dynamic-delete': 'off',
			//Usually "type" by default, but interface when extending
			'@typescript-eslint/consistent-type-definitions': 'off',
			//Annoying for DOM getters
			'@typescript-eslint/no-non-null-assertion': 'off',
			//Sometimes the index name is useful, sometimes it's not
			'@typescript-eslint/consistent-indexed-object-style': 'off',

			// 'no-unused-vars': 'error',
			// 'no-undef': 'error',
			// 'comma-dangle': ['warn', 'always-multiline'],
			// '@stylistic/semi': ['error', 'always'],
			// '@stylistic/member-delimiter-style': [
			// 	'warn',
			// 	{
			// 		multiline: {
			// 			delimiter: 'none',
			// 			requireLast: true,
			// 		},
			// 		singleline: {
			// 			delimiter: 'comma',
			// 			requireLast: false,
			// 		},
			// 	},
			// ],
			// '@stylistic/quotes': [
			// 	'warn',
			// 	'single',
			// 	{
			// 		avoidEscape: true,
			// 	},
			// ],
			// '@stylistic/quote-props': ['warn', 'as-needed'],
		},
	},
	{
		...pluginHtml.configs['flat/recommended'],
		files: ['**/*.html'],
		ignores,
		languageOptions: {
			parser: htmlParser,
		},
		plugins: {
			'@html-eslint': pluginHtml,
		},
		rules: {
			...pluginHtml.configs['flat/recommended'].rules,
			//Wish we could keep head and body flat: https://github.com/yeonjuan/html-eslint/issues/101
			'@html-eslint/indent': ['warn', 'tab'],
			'@html-eslint/quotes': ['warn', 'single'],
			'@html-eslint/attrs-newline': ['warn', {
				ifAttrsMoreThan: 5,
			}],
			'@html-eslint/require-closing-tags': ['warn', {
				selfClosing: 'always',
			}],
		},
	},
);