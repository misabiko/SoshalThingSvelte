import {DummyService} from './service';
import DummyArticle from './article';
import {getHiddenStorage, getMarkedAsReadStorage} from '../../storages/serviceCache';
import {Endpoint, RefreshType} from '../endpoints';
import type {EndpointConstructorInfo} from '../endpoints';
import type {ArticleWithRefs} from '../../articles';
import {getServices} from '../service';

export class DummyEndpoint extends Endpoint {
	readonly name = 'DummyEndpoint';
	readonly service = DummyService.name;

	async refresh(_refreshType: RefreshType) {
		const markAsReadStorage = getMarkedAsReadStorage(DummyService);
		const hiddenStorage = getHiddenStorage(DummyService);

		return [...Array(10).keys()].map(i => ({
			type: 'normal',
			article: new DummyArticle(i, 'bleh' + i, false, false, markAsReadStorage, hiddenStorage),
		} as ArticleWithRefs));
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'DummyEndpoint',
		paramTemplate: [],
		constructor: () => new DummyEndpoint()
	};

	matchParams(_params: any): boolean {
		return true;
	}
}

export class DummyEndpointWithParam extends Endpoint {
	readonly name;
	readonly service = DummyService.name;

	constructor(readonly query: string) {
		super();

		this.name = `Dummy Endpoint ${query}`;
	}

	async refresh(_refreshType: RefreshType) {
		return [];
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'DummyEndpointWithParam',
		paramTemplate: [['query', '']],
		constructor: params => new DummyEndpointWithParam(params.query as string)
	};

	matchParams(params: any): boolean {
		return params.query === this.query;
	}
}

getServices()[DummyService.name].endpointConstructors.push(
	DummyEndpoint.constructorInfo,
	DummyEndpointWithParam.constructorInfo,
);