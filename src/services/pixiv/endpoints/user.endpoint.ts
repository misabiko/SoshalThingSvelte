import {type EndpointConstructorInfo, LoadableEndpoint, PageEndpoint, RefreshType} from '../../endpoints';
import type {ArticleWithRefs} from '~/articles';
import {PixivService} from '../service';
import PixivArticle from '../article';
import type {PixivUser} from '../article';
import {getMarkedAsReadStorage} from '~/storages/serviceCache';
import {getEachPageURL, getUserUrl, parseThumbnail, type BookmarkData} from './index';
import {MediaLoadType, MediaType} from '~/articles/media';
import {avatarHighRes} from './bookmarks.endpoint';
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
			url: getUserUrl(userId)
		};
	}

	matchParams(_params: any): boolean {
		return true;
	}

	parsePage(document: HTMLElement): ArticleWithRefs[] {
		const thumbnails = document.querySelector('section > div > div > ul')?.children;
		if (!thumbnails)
			throw "Couldn't find thumbnails";
		const markedAsReadStorage = getMarkedAsReadStorage(PixivService);

		return [...thumbnails].map(t => this.parseThumbnail(t, markedAsReadStorage)).filter(a => a !== null) as ArticleWithRefs[];
	}

	parseThumbnail(element: Element, markedAsReadStorage: string[]): ArticleWithRefs | null {
		return parseThumbnail(element, markedAsReadStorage, this.user);
	}
}

export class UserAPIEndpoint extends LoadableEndpoint {
	readonly name = 'Pixiv User API Endpoint';
	static service = PixivService.name;
	readonly params;

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

	async _refresh(_refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		let url = new URL(`https://www.pixiv.net/ajax/user/${this.userId}/profile/all`);
		url.searchParams.set('p', (this.currentPage + 1).toString());
		url.searchParams.set('lang', 'en`');
		const listResponse: UserListAjaxResponse = await PixivService.fetch(url.toString(), {headers: {'Accept': 'application/json'}});
		const illustIds = Object.keys(listResponse.body.illusts);
		//Decreasing order sort
		illustIds.sort((a, b) => parseInt(b) - parseInt(a));

		url = new URL(`https://www.pixiv.net/ajax/user/${this.userId}/profile/illusts`);

		//TODO Fetch every illust id first, then fetch 50 according to the currentPage
		for (const id of illustIds.slice(0, 50))
			url.searchParams.append('ids[]', id.toString());
		url.searchParams.set('work_category', 'illust');
		url.searchParams.set('is_first_page', (this.currentPage === 0 ? 1 : 0).toString());
		url.searchParams.set('lang', 'en');

		const response: UserAjaxResponse = await PixivService.fetch(url.toString(), {headers: {'Accept': 'application/json'}});
		if (response.error) {
			console.error('Failed to fetch', response);
			return [];
		}

		const markedAsReadStorage = getMarkedAsReadStorage(PixivService);

		//For now, I'm only parsing illusts, not novels
		return Object.values(response.body.works).map(illust => {
			const bookmarked = illust.bookmarkData !== null;

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
					illust,
					bookmarked,
				),
			};
		});
	}

	matchParams(params: any): boolean {
		return this.userId === params.userId;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'User Endpoint',
		paramTemplate: [
			['userId', 0],
			['page', 0],
		],
		constructor: params => new UserAPIEndpoint(params.userId as number, params.page as number)
	};
}

registerEndpointConstructor(UserAPIEndpoint);
getServices()[PixivService.name].userEndpoint = user => new UserAPIEndpoint((user as PixivUser).id);

export function getUserId() : number {
	return parseInt(window.location.pathname.split('/')[3]);
}

type UserListAjaxResponse = {
	error: false,
	message: '',
	body: {
		illusts: { [id: string]: null }
		manga: { [id: string]: null }
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
			}
		],
		novelSeries: []
		pickup: any[],
		bookmarkCount: {
			[key in 'public' | 'private']: {
				illust: number
				novel: number
			}
		},
		externalSiteWorksStatus: {
			booth: boolean
			sketch: boolean
			vroidHub: boolean
		},
		request: {
			showRequestTab: boolean
			showRequestSentTab: boolean
			postWorks: {
				artworks: []
				novels: []
			}
		}
	}
}

type UserAjaxResponse = {
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
				bookmarkData: BookmarkData | null
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