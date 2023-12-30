import type { EndpointConstructorInfo } from 'services/endpoints';
import { parseResponse, type Instruction } from '../../pageAPI';
import WebSocketPageEndpoint from './WebSocketPageEndpoint';
import {TwitterService} from '../../service';

export default class TwitterForYouTimelineAPIEndpoint extends WebSocketPageEndpoint {
	static service = TwitterService.name;
	readonly name = 'ForYouTimelineAPI';
	params = {};

	constructor() {
		super({
			initEndpoint: 'TwitterForYouTimelineAPIEndpoint',
				responseIncludes: '/HomeTimeline',
				gotoURL: 'https://twitter.com/home',
		});
	}

	matchParams(_params: any): boolean {
		return true;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'TwitterForYouTimelineAPIEndpoint',
		paramTemplate: [],
		constructor: _params => new TwitterForYouTimelineAPIEndpoint()
	};


	async parseResponse(data: HomeTimelineResponse) {
		return parseResponse(data.data.home.home_timeline_urt.instructions);
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