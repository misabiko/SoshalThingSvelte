import type { ArticleAuthor, ArticleIdPair } from '../articles';
import type { SvelteComponent } from 'svelte';
import type { FilterInstance } from '../filters';
import { SortMethod, type SortInfo } from '../sorting';
import ColumnContainer from '../containers/ColumnContainer.svelte';
import SocialArticleView from '../articles/social/SocialArticleView.svelte';
import { defaultFilterInstances } from '../filters';
import type { Endpoint, RefreshType } from '../services/endpoints';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { everyRefreshType } from '../services/endpoints';
import MasonryContainer from '../containers/MasonryContainer.svelte';
import { getServices } from '../services/service';

export type TimelineData = {
	title: string;
	endpoints: TimelineEndpoint[];
	//TODO Document why addedIdPairs is needed
	addedIdPairs: Writable<ArticleIdPair[]>;
	//TODO Give timelines a list of article lists
	articles: Writable<ArticleIdPair[]>;
	section: { useSection: boolean; count: number };
	container: new (...args: any[]) => SvelteComponent;
	articleView: new (...args: any[]) => SvelteComponent;
	columnCount: number;
	rtl: boolean;
	// TODO Add option to set flex-grow: 1 instead of fixed width
	width: number;
	filters: FilterInstance[];
	sortInfo: SortInfo;
	animatedAsGifs: boolean;
	scrollSpeed: number;
	hideText: boolean;
	compact: boolean;	//TODO Reimplement compact
	shouldLoadMedia: boolean;
	hideFilteredOutArticles: boolean;
	mergeReposts: boolean;
	showArticleCount: boolean;
	maxMediaCount: number | null;
	//TODO muteVideos: boolean
}

export function defaultTimeline(articles: ArticleIdPair[] = []): TimelineData {
	return {
		title: 'Timeline',
		endpoints: [],
		addedIdPairs: writable([...articles]),
		articles: writable(articles),
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
		shouldLoadMedia: true,
		hideFilteredOutArticles: true,
		mergeReposts: true,
		showArticleCount: false,
		maxMediaCount: 4,
	};
}

export type TimelineCollection = { [id: string]: TimelineData }

//Would've wanted to use a symbol, but then we need to stringify in json anyway
export const defaultTimelineView = 'default';
export type TimelineView = {
	timelineIds: string[];
	fullscreen: FullscreenInfo;
}

export type TimelineEndpoint = {
	name: string;
	endpoint?: never;
	refreshTypes: Set<RefreshType>;
	filters: FilterInstance[]
} | {
	name?: never;
	endpoint: Endpoint;
	refreshTypes: Set<RefreshType>;
	filters: FilterInstance[]
}

export type FullscreenInfo = {
	index: number | null;
	columnCount: number | null;
	container: ((new (...args: any[]) => SvelteComponent)) | null;
}

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
				filter: { type: 'media', service: null },
				enabled: true,
				inverted: false,
			},
			{
				filter: { type: 'noRef', service: null },
				enabled: true,
				inverted: false,
			}
		],
		container: MasonryContainer,
		columnCount: 3,
	};
}