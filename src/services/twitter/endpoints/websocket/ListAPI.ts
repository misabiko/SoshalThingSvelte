import type { EndpointConstructorInfo } from 'services/endpoints';
import { parseResponse, type Instruction } from '../../pageAPI';
import WebSocketPageEndpoint from './WebSocketPageEndpoint';
import {TwitterService} from '../../service';

export default class TwitterListAPIEndpoint extends WebSocketPageEndpoint {
	static service = TwitterService.name;
	readonly name: string;
	readonly params;

	constructor(listId: string) {
		const name = `TwitterListAPIEndpoint/${listId}`;
		super({
			initEndpoint: name,
			responseIncludes: '/ListLatestTweetsTimeline',
			gotoURL: `https://twitter.com/i/lists/${listId}`,
		});

		this.name = name;

		this.params = {
			listId,
		};
	}

	matchParams(_params: any): boolean {
		return true;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'TwitterListAPIEndpoint',
		paramTemplate: [['listId', '']],
		constructor: ({listId}) => new TwitterListAPIEndpoint(listId as string)
	};

	async parseResponse(data: ListLatestTweetsTimelineResponse) {
		return parseResponse(data.data.list.tweets_timeline.timeline.instructions);
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