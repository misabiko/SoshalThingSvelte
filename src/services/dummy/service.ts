import {get} from 'svelte/store'
import {getWritable, newService, registerService, type Service} from '../service'
import DummyArticle from './article'
import type {ArticleIdPair} from '../../articles'
import {STANDARD_ACTIONS} from '../actions'

export const DummyService: Service<DummyArticle> = {
	...newService('Dummy'),
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