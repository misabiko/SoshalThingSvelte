import { Endpoint, RefreshType, endpoints, timelineEndpoints, type EndpointConstructorInfo, addEndpointArticlesToTimeline } from 'services/endpoints';
import { TwitterService } from '../service';
import { type ArticleWithRefs, getRootArticle } from 'articles';
import { addArticles, getServices } from 'services/service';
import { get } from 'svelte/store';
import { parseResponse, type Instruction } from '../pageAPI';

export default class TwitterListAPIEndpoint extends Endpoint {
	readonly service = TwitterService.name;
	readonly name = 'ListAPI';
	//TODO Move to websocket/streaming endpoint class
	ws = new WebSocket('ws://localhost:443');

	constructor(listId: string) {
		super(new Set<RefreshType>([
			RefreshType.Refresh,
			RefreshType.LoadBottom,
		]));

		this.ws.addEventListener('error', console.error);

		this.ws.addEventListener('open', () => {
			console.log('Connected TwitterListAPIEndpoint to websocket');
			this.ws.send(JSON.stringify({
				initEndpoint: 'TwitterListAPIEndpoint',
				responseIncludes: '/ListLatestTweetsTimeline',
				gotoURL: 'https://twitter.com/i/lists/' + listId,
			}));
		});

		this.ws.addEventListener('message', (data: MessageEvent) => {
			console.trace('TwitterListAPIEndpoint received message: ', data);
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
		name: 'TwitterListAPIEndpoint',
		paramTemplate: ['listId', ''],
		constructor: ({listId}) => new TwitterListAPIEndpoint(listId)
	};

	//TODO Move to twitter scraping file
	async parseAPI(data: ListLatestTweetsTimelineResponse) {
		const articles: ArticleWithRefs[] = parseResponse(data.data.list.tweets_timeline.timeline.instructions);

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

type ListLatestTweetsTimelineResponse = {
	data: {
		list: {
			tweets_timeline: {
				timeline: {
					instructions: Instruction[]
					metadata: object
				}
			}
		}
	}
};