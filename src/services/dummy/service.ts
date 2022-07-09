import {get} from 'svelte/store'
import {getWritable, registerService, type Service, STANDARD_ACTIONS} from '../service'
import DummyArticle from './article'
import type {ArticleIdPair} from '../article'

export const DummyService: Service = {
	name: 'Dummy',
	articles: {},
	articleActions: {
		[STANDARD_ACTIONS.favorite]: {
			action: toggleLike,
			togglable: true,
		},
	},
}
DummyArticle.service = DummyService.name

registerService(DummyService)

async function toggleLike(idPair: ArticleIdPair) {
	const writable = DummyService.articles[idPair.id];
	const oldValue = (get(writable) as DummyArticle).liked;

	getWritable(idPair).update(a => {
		(a as DummyArticle).liked = !oldValue
		return a
	})
}