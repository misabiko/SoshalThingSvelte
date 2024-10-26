import type {TimelineEndpoint} from '~/timelines';
import type {ArticleIdPair, ArticleWithRefs} from '~/articles';
import {getRootArticle} from '~/articles';
import {useFilters} from '~/filters';
import {addArticles, getServices} from './service';
import {get, writable} from 'svelte/store';
import type {Writable} from 'svelte/store';

export const endpoints: {[name: string]: Writable<Endpoint>} = {};

type TimelineEndpoints = {
	endpoints: TimelineEndpoint[]
	addArticles: (idPairs: ArticleIdPair[]) => void
};
export const timelineEndpoints = writable<TimelineEndpoints[]>([]);
let timelineEndpointsValue: TimelineEndpoints[];
timelineEndpoints.subscribe(value => timelineEndpointsValue = value);

export abstract class Endpoint {
	abstract readonly name: string;
	static readonly service: string;
	readonly articleIdPairs: ArticleIdPair[] = [];
	rateLimitInfo: RateLimitInfo | null = null;
	autoRefreshId: number | null;
	autoRefreshInterval = 90_000;
	//TODO Find component type
	menuComponent: any | null = null;
	refreshTypes: Writable<Set<RefreshType>>;
	//Can we make params only if constructorInfo is defined?
	abstract readonly params: EndpointConstructorParams | null;

	constructor(
		refreshTypes = new Set<RefreshType>([
			RefreshType.RefreshStart,
			RefreshType.Refresh,
		]),
	) {
		this.refreshTypes = writable(refreshTypes);

		this.autoRefreshId = null;
	}

	abstract refresh(refreshType: RefreshType): Promise<ArticleWithRefs[]>;

	abstract matchParams(params: any): boolean;

	isRateLimited(): boolean {
		if (this.rateLimitInfo === null)
			return false;
		else
			return this.rateLimitInfo.remaining <= 0 && this.rateLimitInfo.reset > Date.now();
	}

	static readonly constructorInfo: EndpointConstructorInfo;
}

export abstract class PageEndpoint extends Endpoint {
	abstract readonly hostPage: number;

	async refresh(refreshType: RefreshType) {
		return this.hostPageRefresh(refreshType);
	}

	hostPageRefresh(_refreshType: RefreshType): ArticleWithRefs[] {
		return this.parsePage(document);
	}

	abstract parsePage(document: Document): ArticleWithRefs[];
}

export abstract class LoadablePageEndpoint extends PageEndpoint {
	abstract currentPage: number;
	lastPage: number | null = null;

	//Need a way to add RefreshType.LoadTop if currentPage > 0
	protected constructor(refreshTypes = new Set<RefreshType>([
		RefreshType.RefreshStart,
		RefreshType.Refresh,
		RefreshType.LoadBottom,
	])) {
		super(refreshTypes);
	}

	async refresh(refreshType: RefreshType) {
		switch (refreshType) {
			case RefreshType.LoadTop:
				this.currentPage = Math.max(0, --this.currentPage);
				if (this.currentPage === 0)
					this.refreshTypes.update(rt => {
						rt.delete(RefreshType.LoadTop);
						return rt;
					});
				break;
			case RefreshType.LoadBottom:
				++this.currentPage;
				break;
		}

		if (this.currentPage === this.hostPage && getServices()[(this.constructor as typeof Endpoint).service].isOnDomain)
			return this.hostPageRefresh(refreshType);
		else
			return this.parsePage(await this.loadPage());
	}

	abstract loadPage(): Promise<Document>;
}

//Maybe could use mixins to avoid duplicating Loadable part
export abstract class LoadableEndpoint extends Endpoint {
	abstract currentPage: number;
	lastPage: number | null = null;

	protected constructor(refreshTypes = new Set<RefreshType>([
		RefreshType.RefreshStart,
		RefreshType.Refresh,
		RefreshType.LoadBottom,
	])) {
		super(refreshTypes);
	}

	async refresh(refreshType: RefreshType) {
		switch (refreshType) {
			case RefreshType.LoadTop:
				this.currentPage = Math.max(0, --this.currentPage);
				if (this.currentPage === 0)
					this.refreshTypes.update(rt => {
						rt.delete(RefreshType.LoadTop);
						return rt;
					});
				break;
			case RefreshType.LoadBottom:
				++this.currentPage;
				break;
		}

		return await this._refresh(refreshType);
	}

	abstract _refresh(refreshType: RefreshType): Promise<ArticleWithRefs[]>;
}

//TODO Try passing the paramTemplate as a generic
export interface EndpointConstructorInfo {
	readonly name: string
	readonly paramTemplate: [string, ParamType][]
	readonly constructor: (params: EndpointConstructorParams) => Endpoint
}

export type EndpointConstructorParams = Record<string, ParamType>;

export enum RefreshType {
	RefreshStart,
	Refresh,
	LoadTop,
	LoadBottom,
}

export const everyRefreshType = new Set([
	RefreshType.RefreshStart,
	RefreshType.Refresh,
	RefreshType.LoadBottom,
	RefreshType.LoadTop,
]);

type ParamType = string | number | boolean | null;

//Format specific to Twitter
export type RateLimitInfo = {
	limit: number
	remaining: number
	reset: number
};

export function addEndpoint(endpoint: Endpoint) {
	if (Object.hasOwn(endpoints, endpoint.name))
		console.warn(`Endpoint ${endpoint.name} already exists`);
	else
		endpoints[endpoint.name] = writable(endpoint);
}

export async function addEndpointArticlesToTimeline(endpointName: string, articles: ArticleWithRefs[], refreshType?: RefreshType) {
	const matchingTimelineEndpoints = timelineEndpointsValue
		.map(te => ({
			endpoint: te.endpoints
				.find(es => (es.name ?? es.endpoint.name) === endpointName && (refreshType === undefined || es.refreshTypes.has(refreshType))),
			addArticles: te.addArticles,
		}))
		.filter(te => te.endpoint !== undefined) as {endpoint: TimelineEndpoint, addArticles: (idPairs: ArticleIdPair[]) => void}[];

	for (const timelineEndpoint of matchingTimelineEndpoints) {
		//TODO Exclude interval from endpoint filters
		timelineEndpoint.addArticles(
			useFilters(articles, timelineEndpoint.endpoint.filters)
				.map(a => getRootArticle(a).idPair),
		);
	}
}

export async function refreshEndpointName(endpointName: string, refreshType: RefreshType, autoRefreshing = false) {
	const endpoint = get(endpoints[endpointName]);
	if (!get(endpoint.refreshTypes).has(refreshType))
		return;

	const articles = await refreshEndpoint(endpoint, refreshType, autoRefreshing);

	await addEndpointArticlesToTimeline(endpointName, articles, refreshType);
}

export async function refreshEndpoint(endpoint: Endpoint, refreshType: RefreshType, autoRefreshing = false): Promise<ArticleWithRefs[]> {
	if (!get(endpoint.refreshTypes).has(refreshType))
		throw new Error(`Endpoint ${endpoint.name} doesn't have refresh type ${refreshType}`);

	if (endpoint.isRateLimited()) {
		const secondsLeft = Math.ceil((((endpoint.rateLimitInfo as RateLimitInfo).reset * 1000) - Date.now()) / 1000);
		console.log(`${endpoint.name} is rate limited, and resets in ${secondsLeft} seconds.`, endpoint.rateLimitInfo);
		return [];
	}

	if (!autoRefreshing && /*endpoints[endpoint.name] !== undefined &&*/ endpoint.autoRefreshId !== null) {
		clearInterval(endpoint.autoRefreshId);
		endpoint.autoRefreshId = null;
		startAutoRefreshEndpoint(endpoint);
	}

	let articles;
	try {
		articles = await endpoint.refresh(refreshType);
	}catch (e) {
		console.error(`Error refreshing ${endpoint.name}`, e);
		return [];
	}

	if (!articles.length)
		return [];

	//Filtering articles the endpoint already has
	//TODO Update current articles
	endpoint.articleIdPairs.push(...articles
		.map(a => getRootArticle(a).idPair)
		.filter(idPair => !endpoint.articleIdPairs
			.some(pair =>
				pair.service === idPair.service &&
				pair.id === idPair.id,
			),
		),
	);

	addArticles(false, ...articles);

	endpoints[endpoint.name]?.set(endpoint);

	return articles;
}

export function startAutoRefresh(endpointName: string) {
	if (endpoints[endpointName] === undefined)
		throw new Error(`Endpoint ${endpointName} doesn't exist`);

	endpoints[endpointName].update(e => {
		startAutoRefreshEndpoint(e);
		return e;
	});
}

function startAutoRefreshEndpoint(endpoint: Endpoint) {
	if (endpoint.autoRefreshId === null) {
		endpoint.autoRefreshId = window.setInterval(() => {
			console.debug('Refreshing ' + endpoint.name);
			refreshEndpointName(endpoint.name, RefreshType.Refresh, true).then();
		}, endpoint.autoRefreshInterval);
	}
}

export function stopAutoRefresh(endpointName: string) {
	if (endpoints[endpointName] === undefined)
		throw new Error(`Endpoint ${endpointName} doesn't exist`);

	endpoints[endpointName].update(e => {
		clearInterval(e.autoRefreshId as number);
		e.autoRefreshId = null;
		return e;
	});
}