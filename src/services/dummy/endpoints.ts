import {
	Endpoint,
	type EndpointConstructorInfo,
	RefreshType,
	registerEndpoint,
} from '../service'
import {DummyService} from './service'
import DummyArticle from './article'

export class DummyEndpoint extends Endpoint {
	readonly name = 'DummyEndpoint'

	async refresh(refreshType: RefreshType) {
		return [{
			article: new DummyArticle(0, 'bleh', false, false),
			refs: [],
			actualArticleIndex: undefined,
		}]
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

registerEndpoint(DummyService,
	DummyEndpoint.constructorInfo,
	DummyEndpointWithParam.constructorInfo,
)