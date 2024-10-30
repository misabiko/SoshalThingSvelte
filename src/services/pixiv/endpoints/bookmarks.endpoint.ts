import {type EndpointConstructorInfo, LoadableEndpoint, PageEndpoint, RefreshType} from '../../endpoints';
import type {ArticleWithRefs} from '~/articles';
import {PixivService} from '../service';
import PixivArticle, {type CachedPixivArticle} from '../article';
import type {PixivUser} from '../article';
import {getCachedArticlesStorage, getMarkedAsReadStorage} from '~/storages/serviceCache';
import {getWritableArticle, registerEndpointConstructor} from '../../service';
import {
	getUserUrl, illustToArticle,
	parseThumbnail, type PixivResponseWithWorks,
} from './index';

export default class BookmarkPageEndpoint extends PageEndpoint {
	readonly name = 'Bookmark Endpoint';
	static service = PixivService.name;
	readonly hostPage: number;
	readonly user: PixivUser;
	readonly private: boolean;
	readonly params = null;

	constructor() {
		super(new Set([RefreshType.RefreshStart, RefreshType.Refresh]));

		const searchParams = new URLSearchParams(location.search);
		const p = searchParams.get('p');
		this.hostPage = p === null ? 0 : parseInt(p) - 1;

		this.private = searchParams.get('rest') === 'hide';

		const name = document.querySelector('h1')?.textContent;
		if (!name)
			throw new Error("Couldn't find user name");

		const userId = parseInt(window.location.pathname.split('/')[3]!);
		this.user = {
			username: name,
			name,
			id: userId,
			url: getUserUrl(userId),
		};
	}

	async refresh(refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		if (refreshType === RefreshType.Refresh && this.articleIdPairs.length) {
			const url = new URL(`https://www.pixiv.net/ajax/user/${this.user.id}/profile/illusts`);
			for (const {id} of this.articleIdPairs)
				url.searchParams.append('ids[]', id.toString());
			url.searchParams.set('work_category', 'illust');
			url.searchParams.set('is_first_page', this.hostPage.toString());
			url.searchParams.set('lang', 'en`');

			const response: PixivResponseWithWorks = await PixivService.fetch(url.toString(), {headers: {Accept: 'application/json'}});
			for (const work of Object.values(response.body.works))
				getWritableArticle<PixivArticle>({id: parseInt(work.id), service: PixivService.name}).update(a => {
					a.creationTime = new Date(work.createDate);
					return a;
				});
			return [];
		}else
			return await super.refresh(refreshType);
	}

	matchParams(_params: any): boolean {
		return true;
	}

	parsePage(document: Document): ArticleWithRefs[] {
		const thumbnails = document.querySelector('section > div > div > ul')?.children;
		if (!thumbnails)
			throw "Couldn't find thumbnails";
		const markedAsReadStorage = getMarkedAsReadStorage(PixivService);
		const cachedArticlesStorage = getCachedArticlesStorage<CachedPixivArticle>(PixivService);

		return [...thumbnails].map(t => this.parseThumbnail(t, markedAsReadStorage, cachedArticlesStorage)).filter(a => a !== null);
	}

	parseThumbnail(element: Element, markedAsReadStorage: string[], cachedArticlesStorage: Record<number, CachedPixivArticle | undefined>): ArticleWithRefs | null {
		return parseThumbnail(element, markedAsReadStorage, cachedArticlesStorage, this.user);
	}
}

export class BookmarkAPIEndpoint extends LoadableEndpoint {
	readonly name = 'Pixiv Bookmark API Endpoint';
	static service = PixivService.name;
	readonly params;

	constructor(readonly userId: number, readonly r18: boolean, public currentPage = 0) {
		super();

		if (this.currentPage > 0)
			this.refreshTypes.update(rt => {
				rt.add(RefreshType.LoadTop);
				return rt;
			});

		this.params = {
			userId,
			r18,
			page: currentPage,
		};
	}

	async _refresh(_refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		const url = new URL(`https://www.pixiv.net/ajax/user/${this.userId}/illusts/bookmarks?tag=&limit=48&lang=en`);

		url.searchParams.set('offset', (this.currentPage * 48).toString());
		url.searchParams.set('rest', this.r18 ? 'hide' : 'show');

		const response: PixivResponseWithWorks = await PixivService.fetch(url.toString(), {headers: {Accept: 'application/json'}});
		if (response.error) {
			console.error('Failed to fetch', response);
			return [];
		}

		const markedAsReadStorage = getMarkedAsReadStorage(PixivService);
		const cachedArticlesStorage = getCachedArticlesStorage<CachedPixivArticle>(PixivService);

		//For now, I'm only parsing illusts, not novels
		return Object.values(response.body.works)
			.filter(illust => !illust.isMasked)
			.map(illust => illustToArticle(illust, markedAsReadStorage, cachedArticlesStorage));
	}

	matchParams(params: any): boolean {
		return this.userId === params.userId && this.r18 === params.r18;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'Bookmark Endpoint',
		paramTemplate: [
			['userId', 0],
			['r18', false],
			['page', 0],
		],
		constructor: params => new BookmarkAPIEndpoint(params.userId as number, params.r18 as boolean, params.page as number),
	};
}

registerEndpointConstructor(BookmarkAPIEndpoint);

export function avatarHighRes(url: string): string {
	return url.replace(/_\d+\.(\w{3,4})$/, '_170.$1');
}