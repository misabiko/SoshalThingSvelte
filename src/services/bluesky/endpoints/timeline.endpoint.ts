import {Endpoint, type EndpointConstructorInfo, RefreshType} from '~/services/endpoints';
import type {ArticleWithRefs} from '~/articles';
import {getServiceStorage} from '~/storages';
import {BlueskyService} from '~/services/bluesky/service';
import {registerEndpointConstructor} from '~/services/service';
import {parseFeedViewPost} from '~/services/bluesky/article';
import {getMarkedAsReadStorage} from '~/storages/serviceCache';

//TODO Rename to FollowingFeed
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

	async refresh(refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		//TODO Move login to service
		const {identifier, password} = getServiceStorage(BlueskyService.name);
		await BlueskyService.agent.login({
			identifier,
			password,
		});
		const {data} = await BlueskyService.agent.getTimeline({
			cursor: refreshType === RefreshType.LoadBottom ? this.cursor ?? undefined : undefined,
		});
		const {feed, cursor} = data;
		if (!!this.cursor != !!cursor)
			this.refreshTypes.update(r => {
				//if (cursor === null)
				//	r.delete(RefreshType.LoadBottom);
				//else
				r.add(RefreshType.LoadBottom);
				return r;
			});
		this.cursor = cursor ?? null;

		const markedAsReadStorage = getMarkedAsReadStorage(BlueskyService);
		return feed.map(fvp => parseFeedViewPost(fvp, markedAsReadStorage));
	}

	matchParams(_params: any): boolean {
		return true;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'Timeline',
		paramTemplate: [],
		constructor: () => new TimelineEndpoint(),
	};
}

registerEndpointConstructor(TimelineEndpoint);