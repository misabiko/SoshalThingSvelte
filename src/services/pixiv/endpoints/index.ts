import type {ArticleWithRefs} from '../../../articles'
import type {PixivUser} from '../article'
import PixivArticle from '../article'
import {type ArticleMedia, MediaLoadType, MediaType} from '../../../articles/media'

export function parseThumbnail(element: Element, markedAsReadStorage: string[], hiddenStorage: string[], user: PixivUser): ArticleWithRefs | null {
	const anchors = element.querySelectorAll('a')
	const idStr = anchors[0]?.getAttribute('data-gtm-value')
	if (!idStr) {
		if (element.querySelector('span')?.getAttribute('data-gtm-value'))
			return null
		else
			throw new Error("Couldn't find id")
	}
	const id = parseInt(idStr)

	const thumbnailSrc = element.querySelector('img')?.src
	if (!thumbnailSrc) {
		if (element.querySelector('figure'))
			return null
		else
			throw new Error("Couldn't find src")
	}

	const pageCountSpan = element.querySelector('span:nth-child(2)')
	const pageCount = pageCountSpan !== null ? parseInt(pageCountSpan.textContent as string) : 1

	const medias: ArticleMedia[] =
		getEachPageURL(thumbnailSrc, pageCount)
		.map(src => ({
			mediaType: MediaType.Image,
			src,
			ratio: null,
			queueLoadInfo: MediaLoadType.Thumbnail,
		}))

	const title = anchors[1]?.textContent
	if (!title)
		throw new Error("Couldn't find title")

	let bookmarked = false
	const bookmarkButton = element.querySelector('button svg')
	if (bookmarkButton) {
		const color = getComputedStyle(bookmarkButton).color
		bookmarked = color === 'rgb(255, 64, 96)'
	}

	return {
		type: 'normal',
		article: new PixivArticle(
			id,
			medias,
			title,
			user,
			undefined,
			markedAsReadStorage,
			hiddenStorage,
			element,
			bookmarked,
		)
	}
}

export function getEachPageURL(baseUrl: string, pageCount: number): string[] {
	const parsed = baseUrl.replace(/(\/c\/.+)?(\/\w+-)\w+(\/.+_p\d)(_(\w+)\d+)?/, '/img-master$3_square1200')
	const urls = []
	for (let i = 0; i < pageCount; ++i)
		urls.push(parsed.replace(/(_p)\d/, '$1' + i))

	return urls
}

export function getUserUrl(id: number | string): string {
	return 'https://www.pixiv.net/en/users/' + id
}

export function getCurrentPage(): number {
	const p = new URLSearchParams(location.search).get('p')
	return p === null ? 0 : parseInt(p) - 1
}