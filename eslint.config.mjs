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
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	stylistic.configs.customize({
		indent: 4,
		quotes: 'single',
		semi: true,
		arrowParens: false,
	}),
	...eslintPluginSvelte.configs['flat/recommended'],
	{
		plugins: {
			'@typescript-eslint': tseslint.plugin,
			'@stylistic': stylistic,
		},
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				extraFileExtensions: ['.svelte'],
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				...globals.browser,
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
						requireLast: true,
					},
					singleline: {
						delimiter: 'comma',
						requireLast: false,
					},
				},
			],
			'@stylistic/quotes': [
				'warn',
				'single',
				{
					avoidEscape: true,
				},
			],
			'@stylistic/quote-props': ['warn', 'as-needed'],
			'@stylistic/indent': ['warn', 'tab'],
			'@stylistic/indent-binary-ops': ['warn', 'tab'],
			//TODO Try to tweak indent-binary-ops to allow
			/*userIllusts: Record<string, (Omit<Illust,
				| 'urls'
				| 'profileImageUrl'
			> & {
				profileImageUrl?: string
			}) | null>*/
			/*type TimelineDataPartial = Partial<Omit<TimelineData,
				| 'addedIdPairs'
				| 'articles'
				| 'articlesOrder'
				| 'filters'
				| 'showAllMediaArticles'
			> & {
				articles: ArticleIdPair[]
				filters: FilterInstance[]
				articlesOrder: string[]
				showAllMediaArticles: Set<string>
			}>;*/
			'@stylistic/no-mixed-spaces-and-tabs': ['warn', 'smart-tabs'],
			// '@stylistic/spaced-comment': ['warn', 'never'],
			//TODO Debug crash with index.html
			'@stylistic/spaced-comment': 'off',
			'@stylistic/keyword-spacing': ['warn', {
				before: true,
				after: true,
				overrides: {
					else: {before: false},
					catch: {before: false},
					case: {before: false},
					default: {before: false},
				},
			}],
			'@stylistic/object-curly-spacing': ['warn', 'never'],
			'@stylistic/block-spacing': ['warn', 'never'],
			//TODO Add exceptions for single line
			'@stylistic/comma-dangle': ['warn', 'always-multiline'],
			'@stylistic/eol-last': ['warn', 'never'],
			'@stylistic/no-multiple-empty-lines': ['warn', {max: 2}],
			'@stylistic/max-statements-per-line': ['warn', {max: 2}],
			'@stylistic/brace-style': ['warn', '1tbs', {allowSingleLine: true}],
			'@stylistic/arrow-parens': ['warn', 'as-needed'],
			'@stylistic/space-infix-ops': 'off',
			'@stylistic/no-tabs': 'off',
			'@stylistic/multiline-ternary': 'off',
			//Maybe if I could disable it for single line
			'@stylistic/operator-linebreak': 'off',

			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/restrict-plus-operands': ['error', {
				allowNumberAndString: true,
			}],
			'@typescript-eslint/restrict-template-expressions': ['error', {
				allowNumber: true,
				allowBoolean: true,
				allowNullish: true,
			}],
			'@typescript-eslint/no-misused-promises': ['error', {
				checksVoidReturn: {
					arguments: false,
					inheritedMethods: false,
					properties: false,
				},
			}],
			//TODO Ignore overriding async methods with sync methods
			'@typescript-eslint/require-await': 'off',
			//Usually "type" by default, but interface when extending
			'@typescript-eslint/consistent-type-definitions': 'off',
			//Annoying for DOM getters
			'@typescript-eslint/no-non-null-assertion': 'off',
			//Sometimes the index name is useful, sometimes it's not
			'@typescript-eslint/consistent-indexed-object-style': 'off',
			//Having the type is still a good hint
			'@typescript-eslint/no-redundant-type-constituents': 'off',
			//TODO Make a nice convenient Error class
			'@typescript-eslint/only-throw-error': 'off',
			'@typescript-eslint/prefer-promise-reject-errors': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-enum-comparison': 'off',
			'@typescript-eslint/no-dynamic-delete': 'off',
			'@typescript-eslint/non-nullable-type-assertion-style': 'off',
			'@typescript-eslint/no-confusing-void-expression': 'off',
			'@typescript-eslint/no-floating-promises': 'off',

			//TODO Temp
			// '@typescript-eslint/no-unnecessary-condition': 'off',

			'prefer-const': ['warn', {
				destructuring: 'all',
			}],
		},
	},
	{
		files: ['**/*.svelte', '*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tseslint.parser,
				svelteConfig,
			},
		},
		rules: {
			'svelte/require-store-reactive-access': 'error',
			'svelte/html-quotes': ['warn', {
				prefer: 'single',
				dynamic: {
					quoted: false,
				},
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
	{
		files: ['**/*.html', '**/*.js', '**/*.mjs'],
		...tseslint.configs.disableTypeChecked,
	},
);