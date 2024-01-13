import type Article from './articles';
import type {ArticleIdPair} from './articles';
import {getWritable} from './services/service';
import {get, writable} from 'svelte/store';

function hash(idPair: ArticleIdPair, mediaIndex: number) {
	return JSON.stringify({...idPair, mediaIndex});
}

type LoadingInfo = {
	loadings: Set<string>,
	queue: string[]
}

const maxLoading = 5;

export enum LoadingState {
	NotLoaded = 'NotLoaded',
	Loading = 'Loading',
	Loaded = 'Loaded',
}

export const loadingStore = (() => {
	const {subscribe, update} = writable<LoadingInfo>({
		loadings: new Set<string>(),
		queue: [],
	});
	let localLoadings = new Set<string>();
	let localQueue: string[] = [];

	return {
		subscribe,
		requestLoad(idPair: ArticleIdPair, mediaIndex: number) {
			const key = hash(idPair, mediaIndex);

			if (localLoadings.size >= maxLoading) {
				update(store => {
					const idPairStr = key;
					if (!store.queue.includes(idPairStr))
						store.queue.push(idPairStr);
					localQueue = store.queue;
					return store;
				});

				return LoadingState.NotLoaded;
			}

			update(store => {
				store.loadings.add(key);
				localLoadings = store.loadings;
				return store;
			});
			return LoadingState.Loading;
		},
		getLoadingState(idPair: ArticleIdPair, mediaIndex: number, request = false): LoadingState {
			const idPairStr = hash(idPair, mediaIndex);
			if (localLoadings.has(idPairStr))
				return LoadingState.Loading;
			if (localQueue.includes(idPairStr))
				return LoadingState.NotLoaded;

			const loaded = get(getWritable(idPair)).medias[mediaIndex].loaded;
			if (loaded === undefined || loaded)
				return LoadingState.Loaded;
			else if (request) {
				return this.requestLoad(idPair, mediaIndex);
			}else
				return LoadingState.NotLoaded;
		},
		mediaLoaded(idPair: ArticleIdPair, mediaIndex: number) {
			update(store => {
				getWritable(idPair).update(a => {
					a.medias[mediaIndex].loaded = true;
					return a;
				});

				const idPairStr = hash(idPair, mediaIndex);
				store.loadings.delete(idPairStr);

				//In case the article wasn't in loadings, but in queue
				const index = store.queue.findIndex(str => str === idPairStr);
				if (index != -1)
					store.queue.splice(index, 1);

				if (store.queue.length)
					store.loadings.add(store.queue.shift() as string);

				localLoadings = store.loadings;
				localQueue = store.queue;
				return store;
			});

		},
		forceLoading(article: Readonly<Article>, mediaIndex: number) {
			if (article.medias[mediaIndex].loaded === undefined || article.medias[mediaIndex].loaded)
				return;

			update(store => {
				const idPairStr = hash(article.idPair, mediaIndex);
				store.loadings.add(idPairStr);

				const index = store.queue.findIndex(str => str === idPairStr);
				if (index != -1)
					store.queue.splice(index, 1);

				localLoadings = store.loadings;
				localQueue = store.queue;
				return store;
			});
		},
		remove(idPair: ArticleIdPair, mediaIndex: number) {
			update(store => {
				const idPairStr = hash(idPair, mediaIndex);
				store.loadings.delete(idPairStr);

				const index = store.queue.findIndex(str => str === idPairStr);
				if (index != -1)
					store.queue.splice(index, 1);

				localLoadings = store.loadings;
				localQueue = store.queue;

				return store;
			});
		},
		clearLoadings() {
			update(store => {
				store.loadings.clear();
				while (store.loadings.size < maxLoading && store.queue.length)
					store.loadings.add(store.queue.shift() as string);

				localLoadings = store.loadings;
				localQueue = store.queue;
				return store;
			});
		},
		clearQueue() {
			update(store => {
				store.queue = [];
				localQueue = store.queue;
				return store;
			});
		}
	};
})();