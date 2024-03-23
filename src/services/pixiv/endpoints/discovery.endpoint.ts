import {type EndpointConstructorInfo, LoadableEndpoint, RefreshType} from '~/services/endpoints';
import {PixivService} from '~/services/pixiv/service';
import type {ArticleWithRefs} from '~/articles';
import {getCachedArticlesStorage, getMarkedAsReadStorage} from '~/storages/serviceCache';
import type {CachedPixivArticle} from '~/services/pixiv/article';
import {illustToArticle, Mode, type PixivResponseWithPage} from '~/services/pixiv/endpoints/index';

export default class DiscoveryEndpoint extends LoadableEndpoint {
	readonly name = 'Pixiv Discovery Endpoint';
	static service = PixivService.name;
	readonly params;

	constructor(public currentPage = 0, readonly mode = Mode.All) {
		super();

		if (this.currentPage > 0)
			this.refreshTypes.update(rt => {
				rt.add(RefreshType.LoadTop);
				return rt;
			});

		this.params = {
			page: currentPage,
			mode,
		};
	}

	async _refresh(_refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		const url = new URL('https://www.pixiv.net/ajax/discovery/artworks?limit=60&lang=en');
		url.searchParams.set('p', (this.currentPage + 1).toString());
		url.searchParams.set('mode', this.mode);
		const response: DiscoveryAPIResponse = await PixivService.fetch(url.toString(), {headers: {Accept: 'application/json'}});

		const markedAsReadStorage = getMarkedAsReadStorage(PixivService);
		const cachedArticlesStorage = getCachedArticlesStorage<CachedPixivArticle>(PixivService);

		return response.body.thumbnails.illust.map(illust => illustToArticle(illust, markedAsReadStorage, cachedArticlesStorage));
	}

	matchParams(params: any): boolean {
		return this.mode === params.mode;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'DiscoveryEndpoint',
		paramTemplate: [
			['page', 0],
			['mode', Mode.All],
		],
		constructor: params => new this(params.page as number, params.mode as Mode)
	};
}

type DiscoveryAPIResponse = PixivResponseWithPage<{
	ids: number[]
	isLastPage: boolean
	tags: []
}>;