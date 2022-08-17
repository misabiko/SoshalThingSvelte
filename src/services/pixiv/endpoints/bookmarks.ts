import {PageEndpoint, RefreshType} from '../../endpoints'
import type {ArticleWithRefs} from '../../../articles'
import {PixivService} from '../service'
import type PixivArticle from '../article'
import type {PixivUser} from '../article'
import {getHiddenStorage, getMarkedAsReadStorage} from '../../../storages/serviceCache'
import {getWritable} from '../../service'
import {getUserUrl, parseThumbnail} from './index'

export default class BookmarkPageEndpoint extends PageEndpoint {
	readonly name = 'Bookmark Endpoint'
	readonly service = PixivService.name
	readonly hostPage: number
	readonly user: PixivUser
	readonly private: boolean

	constructor() {
		super(new Set([RefreshType.RefreshStart, RefreshType.Refresh]))

		const searchParams = new URLSearchParams(location.search)
		const p = searchParams.get('p')
		this.hostPage = p === null ? 0 : parseInt(p) - 1

		this.private = searchParams.get('rest') === 'hide'

		const name = document.querySelector('h1')?.textContent
		if (!name)
			throw new Error("Couldn't find user name")

		const userId = parseInt(window.location.pathname.split('/')[3])
		this.user = {
			username: name,
			name,
			id: userId,
			url: getUserUrl(userId)
		}
	}

	async refresh(refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		if (refreshType === RefreshType.Refresh && this.articleIdPairs.length) {
			const url = new URL(`https://www.pixiv.net/ajax/user/${this.user.id}/profile/illusts`)
			for (const {id} of this.articleIdPairs)
				url.searchParams.append('ids[]', id.toString())
			url.searchParams.set('work_category', 'illust')
			url.searchParams.set('is_first_page', this.hostPage.toString())
			url.searchParams.set('lang', 'en`')

			const response: FollowAjaxResponse = await fetch(url.toString()).then(r => r.json())
			if (response?.body?.works) {
				for (const work of Object.values(response.body.works))
					getWritable<PixivArticle>({id: parseInt(work.id), service: PixivService.name})?.update(a => {
						a.creationTime = new Date(work.createDate)
						return a
					})
			}
			return []
		}else
			return await super.refresh(refreshType)
	}

	matchParams(_params: any): boolean {
		return true;
	}

	parsePage(document: HTMLElement): ArticleWithRefs[] {
		const thumbnails = document.querySelector('section > div > div > ul')?.children
		if (!thumbnails)
			throw "Couldn't find thumbnails"
		const markedAsReadStorage = getMarkedAsReadStorage(PixivService)
		const hiddenStorage = getHiddenStorage(PixivService)

		return [...thumbnails].map(t => this.parseThumbnail(t, markedAsReadStorage, hiddenStorage)).filter(a => a !== null) as ArticleWithRefs[]
	}

	parseThumbnail(element: Element, markedAsReadStorage: string[], hiddenStorage: string[]): ArticleWithRefs | null {
		return parseThumbnail(element, markedAsReadStorage, hiddenStorage, this.user)
	}
}

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