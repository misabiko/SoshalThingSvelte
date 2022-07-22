
import {DummyService} from './service'
import DummyArticle from './article'
import {getHiddenStorage, getMarkedAsReadStorage} from '../../storages/serviceCache'
import {Endpoint, RefreshType} from '../endpoints'
import type {EndpointConstructorInfo} from '../endpoints'

export class DummyEndpoint extends Endpoint {
	readonly name = 'DummyEndpoint'
	readonly service = DummyService.name

	async refresh(refreshType: RefreshType) {
		const markAsReadStorage = getMarkedAsReadStorage(DummyService)
		const hiddenStorage = getHiddenStorage(DummyService)

		return [...Array(10).keys()].map(i => ({
			article: new DummyArticle(i, 'bleh' + i, false, false, markAsReadStorage, hiddenStorage),
		}))
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'DummyEndpoint',
		paramTemplate: [],
		constructor: () => new DummyEndpoint()
	}

	matchParams(params: any): boolean {
		return true
	}
}

export class DummyEndpointWithParam extends Endpoint {
	readonly name
	readonly service = DummyService.name

	constructor(readonly query: string) {
		super()

		this.name = `Dummy Endpoint ${query}`
	}

	async refresh(refreshType: RefreshType) {
		return []
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'DummyEndpointWithParam',
		paramTemplate: [['query', '']],
		constructor: params => new DummyEndpointWithParam(params.query as string)
	}

	matchParams(params: any): boolean {
		return params.query === this.query
	}
}

DummyService.endpointConstructors.push(
	DummyEndpoint.constructorInfo,
	DummyEndpointWithParam.constructorInfo,
)