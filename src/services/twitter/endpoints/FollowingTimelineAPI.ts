import type { EndpointConstructorInfo } from 'services/endpoints';
import { TwitterService } from '../service';
import { parseResponse, type Instruction } from '../pageAPI';
import WebSocketPageEndpoint from './WebSocketPageEndpoint';

export default class TwitterFollowingTimelineAPIEndpoint extends WebSocketPageEndpoint {
	readonly service = TwitterService.name;
	readonly name = 'FollowingTimelineAPI';

	constructor() {
		super({
			initEndpoint: 'TwitterFollowingTimelineAPIEndpoint',
			responseIncludes: '/HomeLatestTimeline',
			gotoURL: 'https://twitter.com/home',
		});
	}

	matchParams(_params: any): boolean {
		return true;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'TwitterFollowingTimelineAPIEndpoint',
		paramTemplate: [],
		constructor: _params => new TwitterFollowingTimelineAPIEndpoint()
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