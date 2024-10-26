import {Endpoint, type EndpointConstructorInfo, RefreshType} from '~/services/endpoints';
import {BlueskyService} from '~/services/bluesky/service';
import type {ArticleWithRefs} from '~/articles';
import {getMarkedAsReadStorage} from '~/storages/serviceCache';
import {parseFeedViewPost} from '~/services/bluesky/article';
import {getServiceStorage} from '~/storages';
import {getServices, registerEndpointConstructor} from '~/services/service';

export class UserEndpoint extends Endpoint {
	readonly name = 'User';
	static service = BlueskyService.name;
	readonly params;
	cursor: string | null = null;

	constructor(actor: string) {
		super(new Set([
			RefreshType.RefreshStart,
			RefreshType.Refresh,
		]));

		this.params = {
			actor,
		};
	}

	async refresh(refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		//TODO Move login to service
		const {identifier, password} = getServiceStorage(BlueskyService.name);
		await BlueskyService.agent.login({
			identifier,
			password,
		});
		const {data} = await BlueskyService.agent.getAuthorFeed({
			actor: this.params.actor,
			cursor: refreshType === RefreshType.LoadBottom ? this.cursor ?? undefined : undefined,
		});
		const {feed, cursor} = data;
		if (!!this.cursor != !!cursor)
			this.refreshTypes.update(r => {
				// if (cursor === null)
				// 	r.delete(RefreshType.LoadBottom);
				// else
				r.add(RefreshType.LoadBottom);
				return r;
			});
		this.cursor = cursor ?? null;

		const markedAsReadStorage = getMarkedAsReadStorage(BlueskyService);
		return feed.map(fvp => parseFeedViewPost(fvp, markedAsReadStorage));
	}

	matchParams(params: any): boolean {
		return params.actor === this.params.actor;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'User',
		paramTemplate: [['user', '']],
		constructor: params => new UserEndpoint(params.user as string),
	};
}

registerEndpointConstructor(UserEndpoint);
getServices()[BlueskyService.name].userEndpoint = user => new UserEndpoint((user).username);