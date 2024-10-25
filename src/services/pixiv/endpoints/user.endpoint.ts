import {type EndpointConstructorInfo, LoadableEndpoint, PageEndpoint, RefreshType} from '../../endpoints';
import type {ArticleWithRefs} from '~/articles';
import {PixivService} from '../service';
import type {PixivUser} from '../article';
import {type CachedPixivArticle} from '../article';
import {getCachedArticlesStorage, getMarkedAsReadStorage} from '~/storages/serviceCache';
import {
	getUserUrl,
	illustToArticle,
	parseThumbnail,
	type PixivResponse,
	type PixivResponseWithWorks,
} from './index';
import {getServices, registerEndpointConstructor} from '../../service';

export default class UserPageEndpoint extends PageEndpoint {
	readonly name = 'User Endpoint';
	static service = PixivService.name;
	readonly hostPage: number;
	readonly user: PixivUser;
	readonly params = null;

	constructor() {
		super(new Set([RefreshType.RefreshStart, RefreshType.Refresh]));

		const p = new URLSearchParams(location.search).get('p');
		this.hostPage = p === null ? 0 : parseInt(p) - 1;

		const name = document.querySelector('h1')?.textContent;
		if (!name)
			throw new Error("Couldn't find user name");

		const userId = getUserId();
		this.user = {
			username: name,
			name,
			id: userId,
			url: getUserUrl(userId),
		};
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

		return [...thumbnails].map(t => this.parseThumbnail(t, markedAsReadStorage, cachedArticlesStorage)).filter(a => a !== null) as ArticleWithRefs[];
	}

	parseThumbnail(element: Element, markedAsReadStorage: string[], cachedArticlesStorage: Record<number, CachedPixivArticle | undefined>): ArticleWithRefs | null {
		return parseThumbnail(element, markedAsReadStorage, cachedArticlesStorage, this.user);
	}
}

export class UserAPIEndpoint extends LoadableEndpoint {
	readonly name = 'Pixiv User API Endpoint';
	static service = PixivService.name;
	readonly params;

	workIds: number[] = [];

	constructor(readonly userId: number, public currentPage = 0) {
		super();

		if (this.currentPage > 0)
			this.refreshTypes.update(rt => {
				rt.add(RefreshType.LoadTop);
				return rt;
			});

		this.params = {
			userId,
			page: currentPage,
		};
	}

	async _refresh(refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		//profile/all gives you every ids, so we don't need to refetch when loading top/bottom
		if (!this.workIds.length || refreshType === RefreshType.RefreshStart || refreshType === RefreshType.Refresh) {
			const url = new URL(`https://www.pixiv.net/ajax/user/${this.userId}/profile/all`);
			url.searchParams.set('lang', 'en`');

			const listResponse: UserListAjaxResponse = await PixivService.fetch(url.toString(), {headers: {Accept: 'application/json'}});

			const workIds = [];
			workIds.push(...[...Object.keys(listResponse.body.illusts)].map(id => parseInt(id)));
			workIds.push(...[...Object.keys(listResponse.body.manga)].map(id => parseInt(id)));

			//Decreasing order sort
			workIds.sort((a, b) => b - a);

			this.workIds = workIds;
		}

		const workIds = this.workIds.slice(50 * this.currentPage, 50 * (this.currentPage + 1));

		if (workIds.length) {
			const url = new URL(`https://www.pixiv.net/ajax/user/${this.userId}/profile/illusts`);

			for (const id of workIds)
				url.searchParams.append('ids[]', id.toString());
			url.searchParams.set('work_category', 'illust');
			url.searchParams.set('is_first_page', (this.currentPage === 0 ? 1 : 0).toString());
			url.searchParams.set('lang', 'en');

			const response: PixivResponseWithWorks = await PixivService.fetch(url.toString(), {headers: {Accept: 'application/json'}});
			if (response.error) {
				console.error('Failed to fetch', response);
				return [];
			}

			const markedAsReadStorage = getMarkedAsReadStorage(PixivService);
			const cachedArticlesStorage = getCachedArticlesStorage<CachedPixivArticle>(PixivService);

			return Object.values(response.body.works).map(illust => illustToArticle(illust, markedAsReadStorage, cachedArticlesStorage));
		}

		return [];
	}

	matchParams(params: any): boolean {
		return this.userId === params.userId;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'User API Endpoint',
		paramTemplate: [
			['userId', 0],
			['page', 0],
		],
		constructor: params => new UserAPIEndpoint(params.userId as number, params.page as number),
	};
}

registerEndpointConstructor(UserAPIEndpoint);
getServices()[PixivService.name].userEndpoint = user => new UserAPIEndpoint((user as PixivUser).id);

export function getUserId(): number {
	return parseInt(window.location.pathname.split('/')[3]);
}

type UserListAjaxResponse = PixivResponse<{
	illusts: {[id: string]: null}
	manga: {[id: string]: null}
	novels: []
	mangaSeries: [
		{
			id: string
			userId: string
			title: string
			description: string
			caption: string
			total: number
			content_order: null
			url: string
			coverImageSl: number
			firstIllustId: string
			latestIllustId: string
			createDate: string
			updateDate: string
			watchCount: null
			isWatched: boolean
			isNotifying: boolean
		},
	]
	novelSeries: []
	pickup: any[]
	bookmarkCount: {
		[key in 'public' | 'private']: {
			illust: number
			novel: number
		}
	}
	externalSiteWorksStatus: {
		booth: boolean
		sketch: boolean
		vroidHub: boolean
	}
	request: {
		showRequestTab: boolean
		showRequestSentTab: boolean
		postWorks: {
			artworks: []
			novels: []
		}
	}
}>;