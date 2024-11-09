import { type EndpointConstructorInfo, LoadableEndpoint, RefreshType } from '~/services/endpoints';
import type { ArticleWithRefs } from '~/articles';
import { getService, registerEndpointConstructor } from '~/services/service';
import { getCachedArticlesStorage, getMarkedAsReadStorage } from '~/storages/serviceCache';
import { PixivService } from '~/services/pixiv/service';
import PixivArticle, { type CachedPixivArticle } from '~/services/pixiv/article';
import { type ArticleMedia, MediaLoadType, MediaType } from '~/articles/media';

export class RankingAPIEndpoint extends LoadableEndpoint {
	readonly name = 'Pixiv Ranking API Endpoint';
	static service = 'Pixiv';
	readonly params;

	constructor(readonly mode: RankingMode, readonly date: string, public currentPage: number) {
		super();

		if (this.currentPage > 0)
			this.refreshTypes.update(rt => {
				rt.add(RefreshType.LoadTop);
				return rt;
			});

		this.params = {
			mode,
			date,
			page: currentPage,
		};
	}

	async _refresh(_refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		const url = new URL('https://www.pixiv.net/ranking.php');
		url.searchParams.set('format', 'json');
		url.searchParams.set('mode', this.mode);
		url.searchParams.set('date', this.date);
		if (this.currentPage > 0)
			url.searchParams.set('p', (this.currentPage + 1).toString());

		const response: RankingResponse = await getService('Pixiv').fetch(url.toString(), {headers: {Accept: 'application/json'}});
		if ('error' in response)
			throw response.error;

		if (response.prev === false)
			this.refreshTypes.update(rt => {
				rt.delete(RefreshType.LoadTop);
				return rt;
			});
		else
			this.refreshTypes.update(rt => {
				rt.add(RefreshType.LoadTop);
				return rt;
			});
		if (response.next === false)
			this.refreshTypes.update(rt => {
				rt.delete(RefreshType.LoadBottom);
				return rt;
			});
		else
			this.refreshTypes.update(rt => {
				rt.add(RefreshType.LoadBottom);
				return rt;
			});

		const markedAsReadStorage = getMarkedAsReadStorage(PixivService);
		const cachedArticlesStorage = getCachedArticlesStorage<CachedPixivArticle>(PixivService);

		const articles = response.contents.map(c => {
			const cached = cachedArticlesStorage[c.illust_id];

			const medias: ArticleMedia[] = cached?.medias ?? [{
				src: c.url,
				ratio: c.height / c.width,
				mediaType: MediaType.Image,
				queueLoadInfo: MediaLoadType.Thumbnail,
				offsetX: null,
				offsetY: null,
				cropRatio: null,
			}];

			const liked = cached?.liked ?? false;

			return {
				type: 'normal',
				article: new PixivArticle(
					c.illust_id,
					medias,
					c.title,
					{
						id: c.user_id,
						name: c.user_name,
						username: c.user_name,
						url: 'https://www.pixiv.net/en/users/' + c.user_id,
						avatarUrl: c.profile_img,
					},
					new Date(c.illust_upload_timestamp),
					markedAsReadStorage,
					[c],
					liked,
					c.is_bookmarked,
					cached?.medias !== undefined,
				),
			} satisfies ArticleWithRefs;
		});

		articles.reverse();

		return articles;
	}

	matchParams(params: any): boolean {
		return params.mode === this.mode && params.date === this.date && params.page === this.currentPage;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'Ranking API Endpoint',
		paramTemplate: [
			['mode', 'daily'],
			['date', dateToString(new Date())],
			['page', 0],
		],
		constructor: params => new RankingAPIEndpoint(
			params.mode as RankingMode,
			params.date as string,
			params.page as number,
		),
	};
}

registerEndpointConstructor(RankingAPIEndpoint);

function dateToString(date: Date): string {
	return date.getFullYear() + (date.getMonth() + 1).toString().padStart(2, '0') + date.getDate().toString().padStart(2, '0');
}

type RankingMode =
	| 'daily' | 'daily_r18'
	| 'weekly' | 'weekly_r18'
	| 'daily_ai' | 'daily_r18_ai'
	| 'male' | 'male_r18'
	| 'female' | 'female_r18';

type RankingResponse =
	| {
		contents: {
			title: string
			date: string
			tags: string[]
			url: string
			illust_type: string
			illust_book_style: string
			illust_page_count: string
			user_name: string
			profile_img: string
			//illust_content_type: {}
			illust_series: boolean
			illust_id: number
			width: number
			height: number
			user_id: number
			rank: number
			yes_rank: number
			rating_count: number
			view_count: number
			illust_upload_timestamp: number
			attr: string
			is_bookmarked: boolean
			bookmarkable: boolean
		}[]
		mode: RankingMode
		content: 'all'
		page: number
		prev: number | false
		next: number | false
		date: string
		prev_date: string
		next_date: string
		rank_total: number

		error?: never
	} | {error: any};