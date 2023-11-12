import { Endpoint, RefreshType, endpoints, timelineEndpoints, type EndpointConstructorInfo, addEndpointArticlesToTimeline } from 'services/endpoints';
import { TwitterService } from '../service';
import UserTweetsEndpointMenu from './UserTweetsEndpointMenu.svelte';
import { type ArticleWithRefs, getRootArticle } from 'articles';
import { addArticles, getServices } from 'services/service';
import { get } from 'svelte/store';
import { parseResponse } from '../pageAPI';

export default class TwitterUserTweetsAPIEndpoint extends Endpoint {
	readonly service = TwitterService.name;
	readonly name = 'UserTweetsAPI';
	menuComponent = UserTweetsEndpointMenu;
	//TODO Move to websocket/streaming endpoint class
	ws = new WebSocket('ws://localhost:443');

	constructor(username: string) {
		super(new Set<RefreshType>([
			RefreshType.Refresh,
			RefreshType.LoadBottom,
		]));

		this.ws.addEventListener('error', console.error);

		this.ws.addEventListener('open', () => {
			console.log('Connected TwitterUserTweetsAPIEndpoint to websocket');
			this.ws.send(JSON.stringify({
				initEndpoint: 'TwitterUserTweetsAPIEndpoint',
				responseIncludes: '/UserTweets',
				gotoURL: 'https://twitter.com/' + username
			}));
		});

		this.ws.addEventListener('message', (data: MessageEvent) => {
			const json = JSON.parse(data.data);
			this.parseAPI(json);
		});
	}

	async refresh(refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		console.log('refresh');
		switch (refreshType) {
			case RefreshType.Refresh:
				this.ws.send(JSON.stringify({request: 'reload'}));
				break;
			case RefreshType.LoadBottom:
				this.ws.send(JSON.stringify({request: 'scrollDown'}));
				break;
		}

		return [];
	}

	matchParams(_params: any): boolean {
		return true;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'TwitterUserTweetsAPIEndpoint',
		paramTemplate: ['username', ''],
		constructor: ({username}) => new TwitterUserTweetsAPIEndpoint(username)
	};

	//TODO Move to twitter scraping file
	async parseAPI(data: any) {
		const articles: ArticleWithRefs[] = parseResponse(data.data.user.result.timeline_v2.timeline.instructions);

		this.articleIdPairs.push(...articles
			.map(a => getRootArticle(a).idPair)
			.filter(idPair => !this.articleIdPairs
				.some(pair =>
					pair.service === idPair.service &&
					pair.id === idPair.id,
				)
			)
		);

		addArticles(getServices()[this.service], false, ...articles);

		if (endpoints[this.name] !== undefined)
			endpoints[this.name].set(this);

		await addEndpointArticlesToTimeline(this.name, articles);
	}
}