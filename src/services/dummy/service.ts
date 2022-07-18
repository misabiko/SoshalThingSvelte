import {get} from 'svelte/store'
import {getWritable, registerService, type Service, STANDARD_ACTIONS} from '../service'
import DummyArticle from './article'
import type {ArticleIdPair} from '../article'

export const DummyService: Service = {
	name: 'Dummy',
	articles: {},
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
	const writable = getWritable(idPair);
	const oldValue = (get(writable) as DummyArticle).liked;

	writable.update(a => {
		(a as DummyArticle).liked = !oldValue
		return a
	})
}

async function repost(idPair: ArticleIdPair) {
	const writable = getWritable(idPair);
	if ((get(writable) as DummyArticle).reposted)
		return

	writable.update(a => {
		(a as DummyArticle).reposted = true
		return a
	})
}