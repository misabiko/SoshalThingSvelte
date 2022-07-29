import PixivArticle from './article'
import type {FetchingService, Service} from '../service'
import {registerService} from '../service'
import type {Writable} from 'svelte/store'
import {get} from 'svelte/store'
import type {ArticleId} from '../article'
import {getRatio, MediaQueueInfo, MediaType} from '../article'

export const PixivService: PixivServiceType = {
	name: 'Pixiv',
	articles: {},
	endpointConstructors: [],
	userEndpoint: undefined,
	articleActions: {},
	fetchedArticles: new Set<ArticleId>(),
	fetchedArticleQueue: 0,
	fetchTimeout: undefined,
	async fetchArticle(store: Writable<PixivArticle>) {
		const article = get(store)
		const json: PagesResponse = await fetch(`https://www.pixiv.net/ajax/illust/${article.id}/pages`).then(r => r.json())

		store.update(a => {
			for (let i = 0; i < a.medias.length; ++i) {
				const page = json.body[i]
				a.medias[i] = {
					src: page.urls.original,
					ratio: getRatio(page.width, page.height),
					queueLoadInfo: MediaQueueInfo.LazyLoad,
					mediaType: MediaType.Image,
					thumbnail: a.medias[i].queueLoadInfo === MediaQueueInfo.Thumbnail ? {
						src: a.medias[i].src
					}: undefined,
					loaded: false
				}
			}

			a.fetched = true
			PixivService.fetchedArticles.delete(article.idPair.id)

			return a
		})
	},
}
PixivArticle.service = PixivService.name

registerService(PixivService)

interface PixivServiceType extends Service<PixivArticle>, FetchingService<PixivArticle> {}

type PagesResponse = {
	error: boolean
	message: string
	body:
		{
			urls: {
				thumb_mini: string
				small: string
				regular: string
				original: string
			},
			width: number
			height: number
		}[]
}