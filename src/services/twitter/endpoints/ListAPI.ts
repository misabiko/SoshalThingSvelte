import { Endpoint, RefreshType, endpoints, timelineEndpoints, type EndpointConstructorInfo } from 'services/endpoints';
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
		super();

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
			const json = JSON.parse(data.data);
			this.parseAPI(json);
		});
	}

	async refresh(_refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		console.log('refresh');

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

		if (articles.length) {
			const newAddedIdPairs = articles.map(a => getRootArticle(a).idPair);
			//TODO Give timelines access to endpoint articles instead
			for (const timelineEndpoint of get(timelineEndpoints)) {
				timelineEndpoint.addArticles(newAddedIdPairs);
				// timeline.addedIdPairs.update(idPairs => {
				// 	idPairs.push(...newAddedIdPairs);
				// 	return idPairs;
				// });
				// timeline.articles.update(idPairs => {
				// 	idPairs.push(...newAddedIdPairs);
				// 	return idPairs;
				// });
			}
		}
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