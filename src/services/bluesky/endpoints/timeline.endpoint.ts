import {Endpoint, type EndpointConstructorInfo, RefreshType} from '~/services/endpoints';
import type {ArticleWithRefs} from '~/articles';
import {getServiceStorage} from '~/storages';
import {BlueskyService} from '~/services/bluesky/service';
import {registerEndpointConstructor} from '~/services/service';
import BlueskyArticle from '~/services/bluesky/article';
import {getMarkedAsReadStorage} from '~/storages/serviceCache';

export class TimelineEndpoint extends Endpoint {
	readonly name = 'Timeline';
	static service = BlueskyService.name;
	params = {};
	cursor: string | null = null;

	constructor() {
		super(new Set([
			RefreshType.RefreshStart,
			RefreshType.Refresh,
		]));
	}

	async refresh(_refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		//TODO Move login to service
		const {identifier, password} = getServiceStorage(BlueskyService.name);
		await BlueskyService.agent.login({
			identifier,
			password,
		});
		const {data} = await BlueskyService.agent.getTimeline();
		this.cursor = data.cursor ?? null;

		const markedAsReadStorage = getMarkedAsReadStorage(BlueskyService);
		return data.feed.map(({post}) => ({
			type: 'normal',
			article: new BlueskyArticle(post, markedAsReadStorage),
		}));
	}

	matchParams(_params: any): boolean {
		return true;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'Timeline',
		paramTemplate: [],
		constructor: () => new TimelineEndpoint()
	};
}

registerEndpointConstructor(TimelineEndpoint);