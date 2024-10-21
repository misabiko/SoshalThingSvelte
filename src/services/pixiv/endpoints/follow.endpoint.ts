import {type EndpointConstructorInfo, LoadableEndpoint, PageEndpoint, RefreshType} from '../../endpoints';
import type {ArticleWithRefs} from '~/articles';
import {PixivService} from '../service';
import {getCachedArticlesStorage, getMarkedAsReadStorage} from '~/storages/serviceCache';
import type {CachedPixivArticle, PixivUser} from '../article';
import {
	getCurrentPage,
	getUserUrl,
	parseThumbnail,
	illustToArticle, type PixivResponseWithPage
} from './index';
import {registerEndpointConstructor} from '../../service';

export class FollowPageEndpoint extends PageEndpoint {
	readonly name = 'Follow Endpoint';
	static service = PixivService.name;
	readonly hostPage: number;
	readonly params = null;

	constructor() {
		super();

		this.hostPage = getCurrentPage();
	}

	matchParams(_params: any): boolean {
		return true;
	}

	parsePage(document: Document): ArticleWithRefs[] {
		const thumbnails = document.querySelector('section ul')?.children;
		if (!thumbnails)
			throw 'Couldn\'t find thumbnails';
		const markedAsReadStorage = getMarkedAsReadStorage(PixivService);
		const cachedArticlesStorage = getCachedArticlesStorage<CachedPixivArticle>(PixivService);

		return [...thumbnails].map(t => this.parseThumbnail(t, markedAsReadStorage, cachedArticlesStorage)).filter(a => a !== null) as ArticleWithRefs[];
	}

	parseThumbnail(element: Element, markedAsReadStorage: string[], cachedArticlesStorage: Record<number, CachedPixivArticle | undefined>): ArticleWithRefs | null {
		const userAnchor = element.querySelector('section li > div > div:nth-last-child(1) > div > a') as HTMLAnchorElement;
		const userId = parseInt(userAnchor.getAttribute('data-gtm-value') as string);
		const name = userAnchor.textContent as string;
		const user: PixivUser = {
			name,
			username: name,
			id: userId,
			url: getUserUrl(userId)
		};

		return parseThumbnail(element, markedAsReadStorage, cachedArticlesStorage, user);
	}
}

export class FollowAPIEndpoint extends LoadableEndpoint {
	readonly name = 'Pixiv Follow API Endpoint';
	static service = PixivService.name;
	readonly params;

	constructor(public currentPage = 0, readonly r18 = false) {
		super();

		if (this.currentPage > 0)
			this.refreshTypes.update(rt => {
				rt.add(RefreshType.LoadTop);
				return rt;
			});

		this.params = {
			page: currentPage,
			r18,
		};
	}

	async _refresh(_refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		const url = new URL('https://www.pixiv.net/ajax/follow_latest/illust');
		url.searchParams.set('p', (this.currentPage + 1).toString());
		url.searchParams.set('mode', this.r18 ? 'r18' : 'all');
		const response: FollowAPIResponse = await PixivService.fetch(url.toString(), {headers: {Accept: 'application/json'}});

		const markedAsReadStorage = getMarkedAsReadStorage(PixivService);
		const cachedArticlesStorage = getCachedArticlesStorage<CachedPixivArticle>(PixivService);

		//For now, I'm only parsing illusts, not novels
		return response.body.thumbnails.illust.map(illust => illustToArticle(illust, markedAsReadStorage, cachedArticlesStorage));
	}

	matchParams(params: any): boolean {
		return this.r18 === params.r18;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'FollowEndpoint',
		paramTemplate: [
			['page', 0],
			['r18', false],
		],
		constructor: params => new FollowAPIEndpoint(params.page as number, params.r18 as boolean)
	};
}

registerEndpointConstructor(FollowAPIEndpoint);

type FollowAPIResponse = PixivResponseWithPage<{
	ids: number[]
	isLastPage: boolean
	tags: []
}>;