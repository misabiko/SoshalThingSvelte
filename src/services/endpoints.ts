import type {TimelineEndpoint} from '../timelines'
import type {ArticleIdPair, ArticleWithRefs} from '../articles'
import {getRootArticle} from '../articles'
import {useFilters} from '../filters'
import {addArticles, getServices} from './service'
import {get, writable} from 'svelte/store'
import type {Writable} from 'svelte/store'

export const endpoints: { [name: string]: Writable<Endpoint> } = {}

type TimelineEndpoints = {
	endpoints: TimelineEndpoint[],
	addArticles: (idPairs: ArticleIdPair[]) => void
}
export let timelineEndpoints = writable<TimelineEndpoints[]>([])
let timelineEndpointsValue: TimelineEndpoints[]
timelineEndpoints.subscribe(value => timelineEndpointsValue = value)

export abstract class Endpoint {
	abstract readonly name: string
	abstract readonly service: string
	readonly articleIdPairs: ArticleIdPair[] = []
	rateLimitInfo: RateLimitInfo | null = null
	autoRefreshId: number | null
	autoRefreshInterval = 90_000

	constructor(
		public refreshTypes = new Set<RefreshType>([
			RefreshType.RefreshStart,
			RefreshType.Refresh,
		])
	) {
		this.autoRefreshId = null
	}

	abstract refresh(refreshType: RefreshType): Promise<ArticleWithRefs[]>;

	abstract matchParams(params: any): boolean

	isRateLimited(): boolean {
		if (this.rateLimitInfo === null)
			return false
		else
			return this.rateLimitInfo.remaining <= 0 && this.rateLimitInfo.reset > Date.now()
	}

	static readonly constructorInfo: EndpointConstructorInfo
}

export abstract class PageEndpoint extends Endpoint {
	abstract readonly hostPage: number

	async refresh(refreshType: RefreshType) {
		return this.hostPageRefresh(refreshType)
	}

	hostPageRefresh(_refreshType: RefreshType): ArticleWithRefs[] {
		return this.parsePage(document.documentElement)
	}

	abstract parsePage(document: HTMLElement): ArticleWithRefs[]
}

export abstract class LoadablePageEndpoint extends PageEndpoint {
	abstract currentPage: number

	//Need a way to add RefreshType.LoadTop if currentPage > 0
	protected constructor(refreshTypes = new Set<RefreshType>([
		RefreshType.RefreshStart,
		RefreshType.Refresh,
		RefreshType.LoadBottom,
	])) {
		super(refreshTypes)
	}

	async refresh(refreshType: RefreshType) {
		switch (refreshType) {
			case RefreshType.LoadTop:
				this.currentPage = Math.max(0, --this.currentPage)
				if (this.currentPage === 0)
					this.refreshTypes.delete(RefreshType.LoadTop)
				break;
			case RefreshType.LoadBottom:
				++this.currentPage
				break;
		}

		if (this.currentPage === this.hostPage)
			return this.hostPageRefresh(refreshType)
		else
			return this.parsePage(await this.loadPage())
	}

	abstract loadPage(): Promise<HTMLElement>
}

//Maybe could use mixins to avoid duplicating Loadable part
export abstract class LoadableEndpoint extends Endpoint {
	abstract currentPage: number

	protected constructor(refreshTypes = new Set<RefreshType>([
		RefreshType.RefreshStart,
		RefreshType.Refresh,
		RefreshType.LoadBottom,
	])) {
		super(refreshTypes)
	}

	async refresh(refreshType: RefreshType) {
		switch (refreshType) {
			case RefreshType.LoadTop:
				this.currentPage = Math.max(0, --this.currentPage)
				if (this.currentPage === 0)
					this.refreshTypes.delete(RefreshType.LoadTop)
				break;
			case RefreshType.LoadBottom:
				++this.currentPage
				break;
		}

		return await this._refresh(refreshType)
	}

	abstract _refresh(refreshType: RefreshType): Promise<ArticleWithRefs[]>;
}

export interface EndpointConstructorInfo {
	readonly name: string;
	readonly paramTemplate: [string, ParamType][];
	readonly constructor: (params: EndpointConstructorParams) => Endpoint;
}

export type EndpointConstructorParams = { [param: string]: ParamType };

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
])

type ParamType = string | number | boolean;

//Format specific to Twitter
export type RateLimitInfo = {
	limit: number;
	remaining: number;
	reset: number;
}

export function addEndpoint(endpoint: Endpoint) {
	if (endpoints.hasOwnProperty(endpoint.name))
		console.warn(`Endpoint ${endpoint.name} already exists`)
	else
		endpoints[endpoint.name] = writable(endpoint)
}

export async function refreshEndpointName(endpointName: string, refreshType: RefreshType, autoRefreshing = false) {
	const articles = await refreshEndpoint(get(endpoints[endpointName]), refreshType, autoRefreshing)

	const matchingTimelineEndpoints = timelineEndpointsValue
		.map(te => ({
			endpoint: te.endpoints
				.find(es => (es.name ?? es.endpoint.name) === endpointName && es.refreshTypes.has(refreshType)),
			addArticles: te.addArticles
		}))
		.filter(te => te.endpoint !== undefined) as { endpoint: TimelineEndpoint, addArticles: (idPairs: ArticleIdPair[]) => void }[]

	for (const timelineEndpoint of matchingTimelineEndpoints) {
		//TODO Exclude interval from endpoint filters
		timelineEndpoint.addArticles(
			useFilters(articles, timelineEndpoint.endpoint.filters)
				.map(a => getRootArticle(a).idPair)
		)
	}
}

export async function refreshEndpoint(endpoint: Endpoint, refreshType: RefreshType, autoRefreshing = false): Promise<ArticleWithRefs[]> {
	if (!endpoint.refreshTypes.has(refreshType))
		throw new Error(`Endpoint ${endpoint.name} doesn't have refresh type ${refreshType}`)

	if (endpoint.isRateLimited()) {
		const secondsLeft = Math.ceil((((endpoint.rateLimitInfo as RateLimitInfo).reset * 1000) - Date.now()) / 1000)
		console.log(`${endpoint.name} is rate limited, and resets in ${secondsLeft} seconds.`, endpoint.rateLimitInfo)
		return []
	}

	if (!autoRefreshing && endpoints[endpoint.name] !== undefined && endpoint.autoRefreshId !== null) {
		clearInterval(endpoint.autoRefreshId)
		endpoint.autoRefreshId = null
		startAutoRefreshEndpoint(endpoint)
	}

	const articles = await endpoint.refresh(refreshType)
	if (!articles.length)
		return []

	//Filtering articles the endpoint already has
	//TODO Update current articles
	endpoint.articleIdPairs.push(...articles
		.map(a => getRootArticle(a).idPair)
		.filter(idPair => !endpoint.articleIdPairs
			.some(pair =>
				pair.service === idPair.service &&
				pair.id === idPair.id,
			)
		)
	)

	addArticles(getServices()[endpoint.service], false, ...articles)

	if (endpoints[endpoint.name] !== undefined)
		endpoints[endpoint.name].set(endpoint)

	return articles
}

export function startAutoRefresh(endpointName: string) {
	endpoints[endpointName].update(e => {
		startAutoRefreshEndpoint(e)
		return e
	})
}

function startAutoRefreshEndpoint(endpoint: Endpoint) {
	if (endpoint.autoRefreshId === null) {
		endpoint.autoRefreshId = setInterval(() => {
			console.debug('Refreshing ' + endpoint.name)
			refreshEndpointName(endpoint.name, RefreshType.Refresh, true).then()
		}, endpoint.autoRefreshInterval)
	}
}

export function stopAutoRefresh(endpointName: string) {
	endpoints[endpointName].update(e => {
		clearInterval(e.autoRefreshId as number)
		e.autoRefreshId = null
		return e
	})
}
