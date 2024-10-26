import {getRootArticle, type ArticleWithRefs} from '~/articles';
import {Endpoint, RefreshType, addEndpointArticlesToTimeline, endpoints} from './endpoints';
import {addArticles} from './service';

export default abstract class WebSocketEndpoint extends Endpoint {
	ws = new WebSocket('ws://localhost:443');

	constructor(refreshTypes: Set<RefreshType>, setupData: SetupData) {
		super(refreshTypes);

		this.ws.addEventListener('error', console.error);

		this.ws.addEventListener('open', () => {
			console.debug(`Connected ${this.name} to websocket`);
			this.ws.send(JSON.stringify(setupData));
		});

		this.ws.addEventListener('message', async (data: MessageEvent) => {
			console.trace(this.name + ' received message: ', data);
			const json = JSON.parse(data.data);
			const articles = await this.parseResponse(json);

			this.articleIdPairs.push(...articles
				.map(a => getRootArticle(a).idPair)
				.filter(idPair => !this.articleIdPairs
					.some(pair =>
						pair.service === idPair.service &&
						pair.id === idPair.id,
					),
				),
			);

			addArticles(false, ...articles);

			// if (endpoints[this.name] !== undefined)
			endpoints[this.name].set(this);

			await addEndpointArticlesToTimeline(this.name, articles);
		});
	}

	abstract parseResponse(data: any): Promise<ArticleWithRefs[]>;
}

export type SetupData = {
	initEndpoint: string
	responseIncludes: string
	gotoURL: string
};