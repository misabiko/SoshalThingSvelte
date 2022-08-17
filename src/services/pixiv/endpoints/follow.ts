import {type EndpointConstructorInfo, LoadableEndpoint, PageEndpoint, RefreshType} from '../../endpoints'
import type {ArticleWithRefs} from '../../../articles'
import {PixivService} from '../service'
import {getHiddenStorage, getMarkedAsReadStorage} from '../../../storages/serviceCache'
import type {PixivUser} from '../article'
import PixivArticle from '../article'
import {getCurrentPage, getEachPageURL, getUserUrl, parseThumbnail} from './index'
import {MediaLoadType, MediaType} from '../../../articles/media'

export class FollowPageEndpoint extends PageEndpoint {
	readonly name = 'Follow Endpoint'
	readonly service = PixivService.name
	readonly hostPage: number

	constructor() {
		super()

		this.hostPage = getCurrentPage()
	}

	matchParams(_params: any): boolean {
		return true
	}

	parsePage(document: HTMLElement): ArticleWithRefs[] {
		const thumbnails = document.querySelector('section ul')?.children
		if (!thumbnails)
			throw "Couldn't find thumbnails"
		const markedAsReadStorage = getMarkedAsReadStorage(PixivService)
		const hiddenStorage = getHiddenStorage(PixivService)

		return [...thumbnails].map(t => this.parseThumbnail(t, markedAsReadStorage, hiddenStorage)).filter(a => a !== null) as ArticleWithRefs[]
	}

	parseThumbnail(element: Element, markedAsReadStorage: string[], hiddenStorage: string[]): ArticleWithRefs | null {
		const userAnchor = element.querySelector('section li > div > div:nth-last-child(1) > div > a') as HTMLAnchorElement
		const userId = parseInt(userAnchor.getAttribute('data-gtm-value') as string)
		const name = userAnchor.textContent as string
		const user: PixivUser = {
			name,
			username: name,
			id: userId,
			url: getUserUrl(userId)
		}

		return parseThumbnail(element, markedAsReadStorage, hiddenStorage, user)
	}
}

export class FollowAPIEndpoint extends LoadableEndpoint {
	readonly name = 'Pixiv Follow API Endpoint'
	readonly service = PixivService.name

	constructor(public currentPage = 0, readonly r18 = false) {
		super()

		if (this.currentPage > 0)
			this.refreshTypes.add(RefreshType.LoadTop)
	}

	async _refresh(_refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		const url = new URL('https://www.pixiv.net/ajax/follow_latest/illust')
		url.searchParams.set('p', (this.currentPage + 1).toString())
		url.searchParams.set('mode', this.r18 ? 'r18' : 'all')
		const response: FollowAPIResponse = await fetch(url.toString()).then(r => r.json())

		const markedAsReadStorage = getMarkedAsReadStorage(PixivService)
		const hiddenStorage = getHiddenStorage(PixivService)

		//For now, I'm only parsing illusts, not novels
		return response.body.thumbnails.illust.map(illust => {
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
						avatarUrl: illust.profileImageUrl,
					},
					new Date(illust.createDate),
					markedAsReadStorage,
					hiddenStorage,
					illust,
					null,
				),
			}
		})
	}

	matchParams(params: any): boolean {
		return this.r18 === params.r18
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'SearchEndpoint',
		paramTemplate: [
			['page', 0],
			['r18', false],
		],
		constructor: params => new FollowAPIEndpoint(params.page as number, params.r18 as boolean)
	}
}

type FollowAPIResponse = {
	error: boolean
	message: string
	body: {
		page: {
			ids: number[]
			isLastPage: boolean
			tags: []
		}
		tagTranslation: {
			[tag: string]: {
				[key in 'en' | 'ko' | 'zh' | 'zh_tw' | 'romaji']: string
			}
		}
		thumbnails: {
			illust: {
				id: string
				title: string
				illustType: number //enum
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
				urls: {
					//Didn't confirm those were the only sizes
					[key in '250x250' | '360x360' | '540x540']: string
				}
				profileImageUrl: string
			}[]
			novel: []
			novelSeries: []
			novelDraft: []
		}
		illustSeries: []
		requests: []
		users: []
		zoneConfig: {
			[key in 'header' | 'footer' | 'logo']: {
				url: string
			}
		}
	}
}