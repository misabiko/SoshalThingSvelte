import {
	type ArticleAuthor,
	type ArticleIdPair,
	type ArticleIdPairStr,
	getIdPairStr,
} from '~/articles';
import type {ComponentType} from 'svelte';
import type { FilterInstance } from '~/filters';
import { SortMethod, type SortInfo } from '~/sorting';
import ColumnContainer from '~/containers/ColumnContainer.svelte';
import SocialArticleView from '~/articles/social/SocialArticleView.svelte';
import { defaultFilterInstances } from '~/filters';
import type { Endpoint, RefreshType } from '~/services/endpoints';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { everyRefreshType } from '~/services/endpoints';
import MasonryContainer from '~/containers/MasonryContainer.svelte';
import { getServices } from '~/services/service';

export type TimelineData = {
	title: string
	endpoints: TimelineEndpoint[]
	//Keeps track of every added articles, so they're not added again once removed
	addedIdPairs: Writable<Set<ArticleIdPairStr>>
	//TODO Give timelines a list of article lists
	articles: Writable<ArticleIdPair[]>
	articlesOrder: Writable<null | string[]>
	section: { useSection: boolean, count: number }
	container: ComponentType
	articleView: ComponentType
	columnCount: number
	rtl: boolean
	// TODO Add option to set flex-grow: 1 instead of fixed width
	width: number
	filters: FilterInstance[]
	sortInfo: SortInfo
	animatedAsGifs: boolean
	muteVideos: boolean
	scrollSpeed: number
	hideText: boolean
	compact: boolean
	fullMedia: number
	hideQuoteMedia: boolean
	shouldLoadMedia: boolean
	hideFilteredOutArticles: boolean
	mergeReposts: boolean
	showArticleCount: boolean
	maxMediaCount: number | null
	showAllMediaArticles: Writable<Set<string>>
	separateMedia: boolean
};

export function defaultTimeline(articles: ArticleIdPair[] = []): TimelineData {
	return {
		title: 'Timeline',
		endpoints: [],
		addedIdPairs: writable(new Set([...articles].map(getIdPairStr))),
		articles: writable(articles),
		articlesOrder: writable(null),
		section: { useSection: false, count: 100 },
		container: ColumnContainer,
		articleView: SocialArticleView,
		columnCount: 1,
		rtl: false,
		width: 1,
		filters: defaultFilterInstances,
		sortInfo: {
			method: SortMethod.Date,
			customMethod: null,
			reversed: true,
		},
		animatedAsGifs: false,
		scrollSpeed: 3,
		hideText: false,
		compact: false,
		fullMedia: 0,
		hideQuoteMedia: false,
		shouldLoadMedia: true,
		hideFilteredOutArticles: true,
		mergeReposts: true,
		showArticleCount: false,
		maxMediaCount: 4,
		showAllMediaArticles: writable(new Set()),
		separateMedia: false,
		muteVideos: false,
	};
}

export function addArticlesToTimeline(data: TimelineData, ...articles: ArticleIdPair[]) {
	if (!articles.length)
		return;

	data.addedIdPairs.update(addedIdPairs => {
		const newAddedIdPairs: ArticleIdPair[] = [];
		for (const idPair of articles) {
			const idPairStr = getIdPairStr(idPair);
			if (!addedIdPairs.has(idPairStr)) {
				addedIdPairs.add(idPairStr);
				newAddedIdPairs.push(idPair);
			}
		}
		data.articles.update(actualIdPairs => {
			actualIdPairs.push(...newAddedIdPairs);
			return actualIdPairs;
		});

		return addedIdPairs;
	});
}

export type TimelineCollection = { [id: string]: TimelineData };

//Would've wanted to use a symbol, but then we need to stringify in json anyway
export const defaultTimelineView = 'default';
export type TimelineView = {
	timelineIds: string[]
	fullscreen: FullscreenInfo
};

export type TimelineEndpoint = {
	name: string
	endpoint?: never
	refreshTypes: Set<RefreshType>
	filters: FilterInstance[]
} | {
	name?: never
	endpoint: Endpoint
	refreshTypes: Set<RefreshType>
	filters: FilterInstance[]
};

export type FullscreenInfo = {
	index: number | null
	columnCount: number | null
	container: ComponentType | null
};

export function newUserTimeline(serviceName: string, author: ArticleAuthor): TimelineData | null {
	const endpointConstructor = getServices()[serviceName].userEndpoint;
	if (endpointConstructor === null)
		return null;

	return {
		...defaultTimeline(),
		title: author.name,
		endpoints: [{
			endpoint: endpointConstructor(author),
			refreshTypes: everyRefreshType,
			filters: [],
		}],
		filters: [
			...defaultFilterInstances,
			{
				filter: {
					type: 'media',
					service: null,
					props: {},
				},
				enabled: true,
				inverted: false,
			},
			{
				filter: {
					type: 'noRef',
					service: null,
					props: {},
				},
				enabled: true,
				inverted: false,
			}
		],
		container: MasonryContainer,
		columnCount: 3,
	};
}