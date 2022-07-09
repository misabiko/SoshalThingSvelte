import {
	Endpoint,
	type EndpointConstructorInfo,
	type EndpointConstructorParams, type OECI,
	RefreshTime,
	registerEndpoint,
} from '../service'
import {DummyService} from './service'

export class DummyEndpoint extends Endpoint {
	readonly name = 'DummyEndpoint'

	async refresh(refreshTime: RefreshTime) {
		return []
	}

	static readonly constructorInfo = {
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

	async refresh(refreshTime: RefreshTime) {
		return []
	}

	static readonly constructorInfo: OECI = {
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