import {get} from 'svelte/store'
import {getWritable, registerService, type Service, STANDARD_ACTIONS} from '../service'
import DummyArticle from './article'
import type {ArticleIdPair} from '../article'

export const DummyService: Service<DummyArticle> = {
	name: 'Dummy',
	articles: {},
	endpointConstructors: [],
	userEndpoint: undefined,
	articleActions: {
		[STANDARD_ACTIONS.like]: {
			action: toggleLike,
			togglable: true,
		},
		[STANDARD_ACTIONS.repost]: {
			action: repost,
			togglable: false,
		},
	},
}
DummyArticle.service = DummyService.name

registerService(DummyService)

async function toggleLike(idPair: ArticleIdPair) {
	const writable = getWritable<DummyArticle>(idPair);
	const oldValue = get(writable).liked;

	writable.update(a => {
		a.liked = !oldValue
		return a
	})
}

async function repost(idPair: ArticleIdPair) {
	const writable = getWritable<DummyArticle>(idPair);
	if (get(writable).reposted)
		return

	writable.update(a => {
		a.reposted = true
		return a
	})
}