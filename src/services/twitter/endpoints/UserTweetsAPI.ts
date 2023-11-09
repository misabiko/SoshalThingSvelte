import { Endpoint, RefreshType, endpoints, timelineEndpoints, type EndpointConstructorInfo } from 'services/endpoints';
import { TwitterService } from '../service';
import UserTweetsEndpointMenu from './UserTweetsEndpointMenu.svelte';
import { type ArticleWithRefs, getRootArticle } from 'articles';
import { addArticles, getServices } from 'services/service';
import { get } from 'svelte/store';
import { parseResponse } from '../usertweets';

export default class TwitterUserTweetsAPIEndpoint extends Endpoint {
	readonly service = TwitterService.name;
	readonly name = 'UserTweetsAPI';
	menuComponent = UserTweetsEndpointMenu;
	//TODO Move to websocket/streaming endpoint class
	ws = new WebSocket('ws://localhost:443');

	//TODO take username as param
	constructor() {
		super();

		this.ws.addEventListener('error', console.error);

		this.ws.addEventListener('open', () => {
			console.log('Connected TwitterUserTweetsAPIEndpoint to websocket');
			this.ws.send(JSON.stringify({
				initEndpoint: 'TwitterUserTweetsAPIEndpoint',
				responseIncludes: '/UserTweets',
				//gotoURL: 'https://twitter.com/' + process.env.TWITTER_USERNAME
			}));

			//['TwitterUserTweetsAPIEndpoint', 'UserTweets'];
			//['TwitterHomeTimelineAPIEndpoint', 'HomeTimeline'];
			//['TwitterHomeLatestTimelineAPIEndpoint', 'HomeLatestTimeline'];
			//['TwitterListLatestTweetsTimelineAPIEndpoint', 'ListLatestTweetsTimeline'];
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
		name: 'TwitterUserTweetsAPIEndpoint',
		paramTemplate: [],
		constructor: _params => new TwitterUserTweetsAPIEndpoint()
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