import PixivArticle from './article'
import type {FetchingService, Service} from '../service'
import {getWritable, newFetchingService, newService, registerService} from '../service'
import type {Writable} from 'svelte/store'
import {get} from 'svelte/store'
import {type ArticleIdPair, getRatio, MediaQueueInfo, MediaType} from '../article'
import {STANDARD_ACTIONS} from '../actions'
import {getServiceStorage} from '../../storages'

export const PixivService: PixivServiceType = {
	...newService('Pixiv'),
	...newFetchingService(),
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
	articleActions: {
		[STANDARD_ACTIONS.like]: {
			async action(idPair: ArticleIdPair) {
				const csrfToken = getServiceStorage(PixivService.name, 'csrfToken')
				if (!csrfToken)
				 	return

				const response : LikeResponse = await fetch('https://www.pixiv.net/ajax/illusts/like', {
					method: "POST",
					credentials: "same-origin",
					cache: "no-cache",
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json",
						"Cache-Control": "no-cache",
						'X-CSRF-TOKEN': csrfToken,
					},
					body: JSON.stringify({illust_id: idPair.id}),
				}).then(r => r.json())

				if (response.error) {
					console.error("Error during like: ", response)
					return
				}

				if (response.body.is_liked)
					console.debug(idPair.id + ' was already liked.')
				else
					console.debug('Liked ' + idPair.id)

				getWritable<PixivArticle>(idPair).update(a => {
					a.liked = true
					return a
				})
			},
			togglable: false
		}
	}
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

type LikeResponse = {
	body : { is_liked : boolean }
	error : boolean
	message : string
}