import { DummyService } from './service';
import DummyArticle from './article';
import { getMarkedAsReadStorage } from '~/storages/serviceCache';
import { Endpoint, RefreshType } from '../endpoints';
import type { EndpointConstructorInfo } from '../endpoints';
import type { ArticleWithRefs } from '~/articles';
import { getService, registerEndpointConstructor } from '../service';
import { get } from 'svelte/store';

export class DummyEndpoint extends Endpoint {
	readonly name = 'DummyEndpoint';
	static service = DummyService.name;
	params = {};

	async refresh(_refreshType: RefreshType) {
		const markAsReadStorage = getMarkedAsReadStorage(DummyService);

		return [...Array(10).keys()].map(i => ({
			type: 'normal',
			article: new DummyArticle(i, 'bleh' + i, false, false, markAsReadStorage, {
				name: 'DummyAuthor' + i,
				url: '',
				username: 'dummy' + i,
			}),
		} as ArticleWithRefs));
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'DummyEndpoint',
		paramTemplate: [],
		constructor: () => new DummyEndpoint(),
	};

	matchParams(_params: any): boolean {
		return true;
	}
}

export class DummyEndpointWithParam extends Endpoint {
	readonly name;
	static service = DummyService.name;
	readonly params;

	constructor(readonly query: string) {
		super();

		this.name = `Dummy Endpoint ${query}`;

		this.params = {
			query,
		};
	}

	async refresh(_refreshType: RefreshType) {
		return [];
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'DummyEndpointWithParam',
		paramTemplate: [['query', '']],
		constructor: params => new DummyEndpointWithParam(params.query as string),
	};

	matchParams(params: any): boolean {
		return params.query === this.query;
	}
}

export class DummyUserEndpoint extends Endpoint {
	readonly name;
	static service = DummyService.name;
	readonly params;

	constructor(readonly user: string) {
		super();

		this.name = `Dummy Endpoint ${user}`;

		this.params = {
			user,
		};
	}

	async refresh(_refreshType: RefreshType) {
		const authorIndex = parseInt(this.user.replace('dummy', ''));
		const writablePair = getService('Dummy').articles[authorIndex];
		if (writablePair === undefined)
			throw new Error(`Article ${authorIndex} not found`);
		const article = get(writablePair[0]);
		return [{
			type: 'normal',
			article,
		} satisfies ArticleWithRefs];
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'DummyUserEndpoint',
		paramTemplate: [['user', '']],
		constructor: params => new DummyEndpointWithParam(params.user as string),
	};

	matchParams(params: any): boolean {
		return params.user === this.user;
	}
}

registerEndpointConstructor(DummyEndpoint);
registerEndpointConstructor(DummyEndpointWithParam);
registerEndpointConstructor(DummyUserEndpoint);

getService('Dummy').userEndpoint = user => new DummyUserEndpoint((user).username);