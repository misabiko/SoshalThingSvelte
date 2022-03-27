import type Article from './services/article'
import type {ArticleIdPair} from './services/article'
import {getWritable} from './services/service'
import {writable} from 'svelte/store'

function hash(idPair: ArticleIdPair, mediaIndex: number) {
	return JSON.stringify({...idPair, mediaIndex})
}

function createStore() {
	const {subscribe, update} = writable(new Set<string>())
	let local = new Set<string>()

	return {
		subscribe,
		getLoadingState(article: Article, mediaIndex: number, request = false): LoadingState {
			if (local.has(hash(article.idPair, mediaIndex)))
				return LoadingState.Loading

			const loaded = article.medias[mediaIndex].loaded;
			if (loaded === undefined)
				return LoadingState.Loaded
			else if (loaded)
				return LoadingState.Loaded
			else if (request) {
				if (local.size >= maxLoading)
					return LoadingState.NotLoaded

				update(l => {
					l.add(hash(article.idPair, mediaIndex))
					local = l
					return l
				})
				return LoadingState.Loading
			}else
				return LoadingState.NotLoaded
		},
		mediaLoaded(idPair: ArticleIdPair, mediaIndex: number) {
			update(l => {
				l.delete(hash(idPair, mediaIndex))
				local = l
				return l
			})

			getWritable(idPair).update(a => {
				a.medias[mediaIndex].loaded = true;
				return a;
			})
		},
	}
}
export const loadingStore = createStore()
const maxLoading = 5;

export enum LoadingState {
	NotLoaded,
	Loading,
	Loaded,
}