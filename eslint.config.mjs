import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';
import globals from 'globals';
import pluginHtml from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';
import eslintPluginSvelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import stylistic from '@stylistic/eslint-plugin';
import svelteConfig from './svelte.config.js';

export default tseslint.config(
	{
		ignores: [
			'**/dist/',
			'**/dist*/',
			'**/node_modules/',
		],
	},
	eslint.configs.recommended,
	//TODO TypeChecked

	...tseslint.configs.strict,
	...tseslint.configs.stylistic,
	// stylistic.configs.customize({
	// 	indent: 4,
	// 	quotes: 'single',
	// 	semi: true,
	// }),
	...eslintPluginSvelte.configs['flat/recommended'],
	{
		plugins: {
			'@typescript-eslint': tseslint.plugin,
			'@stylistic': stylistic,
		},
		languageOptions: {
			parser: tseslint.parser,
			globals: {
				...globals.browser,
			},
			parserOptions: {
				extraFileExtensions: ['.svelte'],
			},
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
			'@typescript-eslint/no-empty-function': 'off',

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
		files: ['**/*.svelte', '*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tseslint.parser,
				svelteConfig,
			}
		},
		rules: {
			'svelte/require-store-reactive-access': 'error',
			'svelte/html-quotes': ['warn', {
				prefer: 'single',
				dynamic: {
					quoted: false,
					avoidInvalidUnquotedInHTML: true
				}
			}],
			//TODO Some way to track issues via comments
			//https://github.com/sveltejs/eslint-plugin-svelte/issues/818
			//https://github.com/sveltejs/eslint-plugin-svelte/pull/816
			'prefer-const': 'off',
			//TODO Investigate false positives
			'svelte/no-unused-svelte-ignore': 'off',
		},
	},
	{
		...pluginHtml.configs['flat/recommended'],
		files: ['**/*.html'],
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