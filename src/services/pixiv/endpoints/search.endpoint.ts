import {type EndpointConstructorInfo, LoadableEndpoint, RefreshType} from '../../endpoints';
import type {ArticleWithRefs} from '~/articles';
import {PixivService} from '../service';
import {getCachedArticlesStorage, getMarkedAsReadStorage} from '~/storages/serviceCache';
import {
	type ExtraData,
	type Illust,
	illustToArticle, Mode,
	type PixivResponse,
	type TagTranslation, type ZoneConfig,
} from './index';
import {registerEndpointConstructor} from '../../service';

// export default class SearchPageEndpoint extends PageEndpoint {
// 	readonly name = 'User Endpoint';
// 	static service = PixivService.name;
// 	readonly hostPage: number;
// 	readonly user: PixivUser;
// 	readonly params = null;
//
// 	constructor() {
// 		super(new Set([RefreshType.RefreshStart, RefreshType.Refresh]));
//
// 		const p = new URLSearchParams(location.search).get('p');
// 		this.hostPage = p === null ? 0 : parseInt(p) - 1;
//
// 		const name = document.querySelector('h1')?.textContent;
// 		if (!name)
// 			throw new Error("Couldn't find user name");
//
// 		const query = getUserId();
// 		this.user = {
// 			username: name,
// 			name,
// 			id: query,
// 			url: getUserUrl(query)
// 		};
// 	}
//
// 	matchParams(_params: any): boolean {
// 		return true;
// 	}
//
// 	parsePage(document: HTMLElement): ArticleWithRefs[] {
// 		const thumbnails = document.querySelector('section > div > div > ul')?.children;
// 		if (!thumbnails)
// 			throw "Couldn't find thumbnails";
// 		const markedAsReadStorage = getMarkedAsReadStorage(PixivService);
// 		const cachedArticlesStorage = getCachedArticlesStorage<CachedPixivArticle>(PixivService);
//
// 		return [...thumbnails].map(t => this.parseThumbnail(t, markedAsReadStorage, cachedArticlesStorage)).filter(a => a !== null) as ArticleWithRefs[];
// 	}
//
// 	parseThumbnail(element: Element, markedAsReadStorage: string[], cachedArticlesStorage: Record<number, CachedPixivArticle | undefined>): ArticleWithRefs | null {
// 		return parseThumbnail(element, markedAsReadStorage, cachedArticlesStorage, this.user);
// 	}
// }

export class SearchAPIEndpoint extends LoadableEndpoint {
	readonly name = 'Pixiv Search API Endpoint';
	static service = PixivService.name;
	readonly params;

	constructor(readonly query: string, readonly mode: Mode, public currentPage = 0) {
		super();

		if (this.currentPage > 0)
			this.refreshTypes.update(rt => {
				rt.add(RefreshType.LoadTop);
				return rt;
			});

		this.params = {
			query,
			mode,
			page: currentPage,
			bookmarkMin: null as number | null,
			bookmarkMax: null as number | null,
		};
	}

	async _refresh(_refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		const url = new URL(`https://www.pixiv.net/ajax/search/artworks/${this.query}?mode=${this.mode}`);
		if (this.currentPage > 0)
			url.searchParams.set('p', (this.currentPage + 1).toString());
		if (this.params.bookmarkMin !== null)
			url.searchParams.set('blt', this.params.bookmarkMin.toString());
		if (this.params.bookmarkMax !== null)
			url.searchParams.set('bgt', this.params.bookmarkMax.toString());

		const response: SearchAjaxResponse = await PixivService.fetch(url.toString(), {headers: {Accept: 'application/json'}});
		if (response.error)
			throw {message: response.message, response};

		this.lastPage = response.body.illustManga.lastPage;

		//TODO Add popular to separate list

		return response.body.illustManga.data.map(i => illustToArticle(i, getMarkedAsReadStorage(PixivService), getCachedArticlesStorage(PixivService)));
	}

	matchParams(params: any): boolean {
		return this.query === params.query;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'User API Endpoint',
		paramTemplate: [
			['query', ''],
			['mode', Mode.All],
			['page', 0],
			['bookmarkMin', null],
			['bookmarkMax', null],
		],
		constructor: params => new SearchAPIEndpoint(params.query as string, params.mode as Mode, params.page as number)
	};
}

registerEndpointConstructor(SearchAPIEndpoint);

type SearchAjaxResponse = PixivResponse<{
	illustManga: {
		data: Illust[]
		total: number
		//1-indexed
		lastPage: number
		//TODO Figure out what bookmarkRanges is
		bookmarkRanges: {
			min: number | null
			max: number | null
		}[]
	}
	popular: {
		recent: Illust[]
		permanent: Illust[]
	}
	relatedTags: string[]
	tagTranslation: TagTranslation
	zoneConfig: ZoneConfig
	extraData: ExtraData
}>;