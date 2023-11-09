import { Endpoint, RefreshType, endpoints, timelineEndpoints, type EndpointConstructorInfo } from 'services/endpoints';
import { TwitterService } from '../service';
import { type ArticleWithRefs, getRootArticle } from 'articles';
import { addArticles, getServices } from 'services/service';
import { get } from 'svelte/store';
import { parseResponse, type Instruction } from '../pageAPI';

export default class TwitterFollowingTimelineAPIEndpoint extends Endpoint {
	readonly service = TwitterService.name;
	readonly name = 'FollowingTimelineAPI';
	//TODO Move to websocket/streaming endpoint class
	ws = new WebSocket('ws://localhost:443');

	constructor() {
		super();

		this.ws.addEventListener('error', console.error);

		//TODO Send command to click on Following tab
		this.ws.addEventListener('open', () => {
			console.log('Connected TwitterFollowingTimelineAPIEndpoint to websocket');
			this.ws.send(JSON.stringify({
				initEndpoint: 'TwitterFollowingTimelineAPIEndpoint',
				responseIncludes: '/HomeLatestTimeline',
				gotoURL: 'https://twitter.com/home',
			}));
		});

		this.ws.addEventListener('message', (data: MessageEvent) => {
			console.log('received: ', data);
			const json = JSON.parse(data.data);
			console.log('json: ', json);
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
		name: 'TwitterFollowingTimelineAPIEndpoint',
		paramTemplate: [],
		constructor: _params => new TwitterFollowingTimelineAPIEndpoint()
	};

	//TODO Move to twitter scraping file
	async parseAPI(data: HomeTimelineResponse) {
		const articles: ArticleWithRefs[] = parseResponse(data.data.home.home_timeline_urt.instructions);

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

type HomeTimelineResponse = {
	data: {
		home: {
			home_timeline_urt: {
				instructions: Instruction[]
				responseObjects: object
				metadata: object
			}
		}
	}
};