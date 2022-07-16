import type Article from './services/article'
import type {ArticleIdPair} from './services/article'
import {getWritable} from './services/service'
import {get, writable} from 'svelte/store'

function hash(idPair: ArticleIdPair, mediaIndex: number) {
	return JSON.stringify({...idPair, mediaIndex})
}

function createStore() {
	const {subscribe, update} = writable(new Set<string>())
	let local = new Set<string>()

	return {
		subscribe,
		getLoadingState(idPair: ArticleIdPair, mediaIndex: number, request = false): LoadingState {
			if (local.has(hash(idPair, mediaIndex)))
				return LoadingState.Loading

			const loaded = get(getWritable(idPair)).medias[mediaIndex].loaded;
			if (loaded === undefined)
				return LoadingState.Loaded
			else if (loaded)
				return LoadingState.Loaded
			else if (request) {
				if (local.size >= maxLoading)
					return LoadingState.NotLoaded

				update(l => {
					l.add(hash(idPair, mediaIndex))
					local = l
					return l
				})
				return LoadingState.Loading
			}else
				return LoadingState.NotLoaded
		},
		mediaLoaded(idPair: ArticleIdPair, mediaIndex: number) {
			update(l => {
				getWritable(idPair).update(a => {
					a.medias[mediaIndex].loaded = true;
					return a;
				})

				l.delete(hash(idPair, mediaIndex))
				local = l
				return l
			})

		},
		forceLoading(article: Readonly<Article>, mediaIndex: number) {
			if (article.medias[mediaIndex].loaded === undefined || article.medias[mediaIndex].loaded)
				return

			update(l => {
				l.add(hash(article.idPair, mediaIndex))
				local = l
				return l
			})
		}
	}
}
export const loadingStore = createStore()
const maxLoading = 5;

export enum LoadingState {
	NotLoaded,
	Loading,
	Loaded,
}