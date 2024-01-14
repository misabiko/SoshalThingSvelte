import {Endpoint, type EndpointConstructorInfo, RefreshType} from '~/services/endpoints';
import {getServices, registerEndpointConstructor} from '~/services/service';
import {illustToArticle, type PixivResponseWithPage} from '~/services/pixiv/endpoints/index';
import {getCachedArticlesStorage, getMarkedAsReadStorage} from '~/storages/serviceCache';
import {PixivService} from '~/services/pixiv/service';
import {type CachedPixivArticle} from '~/services/pixiv/article';
import type {ArticleWithRefs} from '~/articles';

//TODO Support multiple output lists instead?
export enum TopOutput {
	All = 'all',
	Follow = 'follow',
	Recommended = 'recommended',
}

export class TopAPIEndpoint extends Endpoint {
	readonly name = 'Pixiv Top API Endpoint';
	static service = 'Pixiv';
	readonly params;

	constructor(readonly r18: boolean, readonly output: TopOutput) {
		super(new Set([RefreshType.RefreshStart, RefreshType.Refresh]));

		this.params = {
			r18,
			output,
		};
	}

	async refresh(_refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		const response: TopResponse = await getServices()['Pixiv'].fetch('https://www.pixiv.net/ajax/top/illust?mode=all', {
			headers: {'Accept': 'application/json'}
		});

		if (response.error)
			throw response.message;

		const markedAsReadStorage = getMarkedAsReadStorage(PixivService);
		const cachedArticlesStorage = getCachedArticlesStorage<CachedPixivArticle>(PixivService);

		const illustThumbnails = Object.fromEntries(response.body.thumbnails.illust.map(illust => [parseInt(illust.id), illust]));

		let ids;
		switch (this.output) {
			case TopOutput.All:
				ids = Object.keys(illustThumbnails);
				break;
			case TopOutput.Follow:
				ids = response.body.page.follow;
				break;
			case TopOutput.Recommended:
				ids = response.body.page.recommend.ids;
				break;
		}

		return ids
			.map(id => illustThumbnails[id.toString()])
			.map(illust => illustToArticle(illust, markedAsReadStorage, cachedArticlesStorage));
	}

	matchParams(params: any): boolean {
		return params.r18 === this.r18 && params.output === this.output;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'TopEndpoint',
		paramTemplate: [
			['r18', false],
			['output', TopOutput.All],
		],
		constructor: params => new TopAPIEndpoint(params.r18 as boolean, params.output as TopOutput)
	};
}

registerEndpointConstructor(TopAPIEndpoint);

type TopResponse = PixivResponseWithPage<{
	tags: {
		tag: string
		ids: number[]
	}[]
	follow: number[]
	mypixiv: []
	recommend: {
		ids: string[]
		details: Record<string, Detail>
	}
	recommendByTag: {
		tag: string
		ids: string[]
		details: Record<string, Detail>
	}[]
	ranking: {
		items: {
			rank: string
			id: string
		}[]
		date: string
	}
	pixivision: {
		id: string
		title: string
		thumbnailUrl: string
		url: string
	}[]
	// recommendUser: {
	// 	id: number
	// 	illustIds: string[]
	// 	novelIds: string[]
	// }[]
	// contestOngoing: {}[]
	// contestResult: []
	// editorRecommend: []
	// boothFollowItemIds: []
	// sketchLiveFollowIds: []
	// sketchLivePopularIds: []
	// myFavoriteTags: []
	// newPost: []
	// trendingTags: []
	// completeRequestIds: []
	// userEventIds: []
}>;

type Detail = {
	methods: string[]
	score: number
	seedIllustIds: string[]
};