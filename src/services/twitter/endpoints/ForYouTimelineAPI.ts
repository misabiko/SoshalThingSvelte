import { Endpoint, RefreshType, endpoints, timelineEndpoints, type EndpointConstructorInfo } from 'services/endpoints';
import { TwitterService } from '../service';
import { type ArticleWithRefs, getRootArticle } from 'articles';
import { addArticles, getServices } from 'services/service';
import { get } from 'svelte/store';
import { parseResponse, type Instruction } from '../pageAPI';

export default class TwitterForYouTimelineAPIEndpoint extends Endpoint {
	readonly service = TwitterService.name;
	readonly name = 'ForYouTimelineAPI';
	//TODO Move to websocket/streaming endpoint class
	ws = new WebSocket('ws://localhost:443');

	constructor() {
		super(new Set<RefreshType>([
			RefreshType.Refresh,
			RefreshType.LoadBottom,
		]));

		this.ws.addEventListener('error', console.error);

		this.ws.addEventListener('open', () => {
			console.log('Connected TwitterForYouTimelineAPIEndpoint to websocket');
			this.ws.send(JSON.stringify({
				initEndpoint: 'TwitterForYouTimelineAPIEndpoint',
				responseIncludes: '/HomeTimeline',
				gotoURL: 'https://twitter.com/home',
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
		name: 'TwitterForYouTimelineAPIEndpoint',
		paramTemplate: [],
		constructor: _params => new TwitterForYouTimelineAPIEndpoint()
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