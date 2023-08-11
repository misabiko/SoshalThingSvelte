import {type EndpointConstructorInfo, LoadableEndpoint, PageEndpoint, RefreshType} from '../../endpoints';
import type {ArticleWithRefs} from '../../../articles';
import {PixivService} from '../service';
import PixivArticle from '../article';
import type {PixivUser} from '../article';
import {getHiddenStorage, getMarkedAsReadStorage} from '../../../storages/serviceCache';
import {getWritable} from '../../service';
import {getEachPageURL, getUserUrl, parseThumbnail} from './index';
import {MediaLoadType, MediaType} from '../../../articles/media';

export default class BookmarkPageEndpoint extends PageEndpoint {
	readonly name = 'Bookmark Endpoint';
	readonly service = PixivService.name;
	readonly hostPage: number;
	readonly user: PixivUser;
	readonly private: boolean;

	constructor() {
		super(new Set([RefreshType.RefreshStart, RefreshType.Refresh]));

		const searchParams = new URLSearchParams(location.search);
		const p = searchParams.get('p');
		this.hostPage = p === null ? 0 : parseInt(p) - 1;

		this.private = searchParams.get('rest') === 'hide';

		const name = document.querySelector('h1')?.textContent;
		if (!name)
			throw new Error("Couldn't find user name");

		const userId = parseInt(window.location.pathname.split('/')[3]);
		this.user = {
			username: name,
			name,
			id: userId,
			url: getUserUrl(userId)
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

			const response: FollowAjaxResponse = await fetch(url.toString()).then(r => r.json());
			if (response?.body?.works) {
				for (const work of Object.values(response.body.works))
					getWritable<PixivArticle>({id: parseInt(work.id), service: PixivService.name})?.update(a => {
						a.creationTime = new Date(work.createDate);
						return a;
					});
			}
			return [];
		}else
			return await super.refresh(refreshType);
	}

	matchParams(_params: any): boolean {
		return true;
	}

	parsePage(document: HTMLElement): ArticleWithRefs[] {
		const thumbnails = document.querySelector('section > div > div > ul')?.children;
		if (!thumbnails)
			throw "Couldn't find thumbnails";
		const markedAsReadStorage = getMarkedAsReadStorage(PixivService);
		const hiddenStorage = getHiddenStorage(PixivService);

		return [...thumbnails].map(t => this.parseThumbnail(t, markedAsReadStorage, hiddenStorage)).filter(a => a !== null) as ArticleWithRefs[];
	}

	parseThumbnail(element: Element, markedAsReadStorage: string[], hiddenStorage: string[]): ArticleWithRefs | null {
		return parseThumbnail(element, markedAsReadStorage, hiddenStorage, this.user);
	}
}

export class BookmarkAPIEndpoint extends LoadableEndpoint {
	readonly name = 'Pixiv Bookmark API Endpoint';
	readonly service = PixivService.name;

	constructor(readonly userId: number, readonly r18: boolean, public currentPage = 0) {
		super();

		if (this.currentPage > 0)
			this.refreshTypes.add(RefreshType.LoadTop);
	}

	async _refresh(_refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		const url = new URL(`https://www.pixiv.net/ajax/user/${this.userId}/illusts/bookmarks?tag=&offset=0&limit=48&rest=hide&lang=en`);

		//url.searchParams.set('tag', '')
		//url.searchParams.set('offset', '')
		//url.searchParams.set('limit', '')
		url.searchParams.set('rest', this.r18 ? 'hide' : 'show');
		url.searchParams.set('lang', 'en');

		const response: FollowAjaxResponse = await fetch(url.toString()).then(r => r.json());
		if (response.error) {
			console.error('Failed to fetch', response);
			return [];
		}

		const markedAsReadStorage = getMarkedAsReadStorage(PixivService);
		const hiddenStorage = getHiddenStorage(PixivService);

		//For now, I'm only parsing illusts, not novels
		return Object.values(response.body.works).map(illust => {
			return {
				type: 'normal',
				article: new PixivArticle(
					parseInt(illust.id),
					getEachPageURL(illust.url, illust.pageCount).map(src => ({
						mediaType: MediaType.Image,
						src,
						ratio: null,
						queueLoadInfo: MediaLoadType.Thumbnail,
					})),
					illust.title,
					{
						id: parseInt(illust.userId),
						url: getUserUrl(illust.userId),
						username: illust.userName,
						name: illust.userName,
						avatarUrl: avatarHighRes(illust.profileImageUrl),
					},
					new Date(illust.createDate),
					markedAsReadStorage,
					hiddenStorage,
					illust,
					null,
				),
			};
		});
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
		constructor: params => new BookmarkAPIEndpoint(params.userId as number, params.r18 as boolean, params.page as number)
	};
}

//TODO Abstract responses
type FollowAjaxResponse = {
	error: boolean
	message: string
	body: {
		works: {[id: string]: {
				id: string
				title: string
				illustType: number
				xRestrict: number
				restrict: number
				sl: number
				url: string
				description: string
				tags: string[]
				userId: string
				userName: string
				width: number
				height: number
				pageCount: number
				isBookmarkable: boolean
				bookmarkData: null
				alt: string
				titleCaptionTranslation: {
					workTitle: null
					workCaption: null
				}
				createDate: string
				updateDate: string
				isUnlisted: boolean
				isMasked: boolean
				profileImageUrl: string
		}}
	}
	zoneConfig: {
		header: { url: string }
		footer: { url: string }
		logo: { url: string }
		'500x500': { url: string }
	}
	extraData: {
		meta: {
			title: string
			description: string
			canonical: string
			ogp: {
				description: string
				image: string
				title: string
				type: string
			},
			twitter: {
				description: string
				image: string
				title: string
				card: string
			},
			alternateLanguages: {
				ja: string
				en: string
			},
			descriptionHeader: string
		}
	}
}

export function avatarHighRes(url: string): string {
	return url.replace(/_\d+\.(\w{3,4})$/, '_170.$1');
}