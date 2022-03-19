import type Article from './article';
import type {Readable} from 'svelte/store'

export interface Service {
	readonly name: string;
	readonly articles: {[id: string | number]: Readable<Article>};
}

export abstract class Endpoint {
	readonly name: string;
	readonly articleIds: string[];

	static readonly constructorInfo: EndpointConstructorInfo;

	addArticles(ids: string[]) {
		for (const id of ids) {
			if (!this.articleIds.includes(id))
				this.articleIds.push(id);
		}
	}

	abstract refresh(refreshTime: RefreshTime);

	loadTop(refreshTime: RefreshTime) {
		console.debug(`${this.name} doesn't implement loadTop()`);
		this.refresh(refreshTime);
	}

	loadBottom(refreshTime: RefreshTime) {
		console.debug(`${this.name} doesn't implement loadBottom()`);
		this.refresh(refreshTime);
	}
}

interface EndpointConstructorInfo {
	readonly name: string;
	readonly paramTemplate: [string, ParamType][];
	readonly constructor: new (params: { [param: string]: ParamType }) => Endpoint;
}

export enum RefreshTime {
	OnStart,
	OnRefresh,
}

type ParamType = string | number | boolean;

const endpoints: Endpoint[] = [];
const endpointConstructors: EndpointConstructorInfo[] = [];

export function registerEndpoints(constructors: EndpointConstructorInfo[]) {
	endpointConstructors.push(...constructors);
}
