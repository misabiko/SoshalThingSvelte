import type { EndpointConstructorInfo } from '~/services/endpoints';
import { parseResponse, type Instruction } from '../../pageAPI';
import WebSocketPageEndpoint from './WebSocketPageEndpoint';
import {TwitterService} from '../../service';

export default class TwitterFollowingTimelineAPIEndpoint extends WebSocketPageEndpoint {
	static service = TwitterService.name;
	readonly name = 'FollowingTimelineAPI';
	params = {};

	constructor() {
		super({
			initEndpoint: 'TwitterFollowingTimelineAPIEndpoint',
			responseIncludes: '/HomeLatestTimeline',
			gotoURL: 'https://x.com/home',
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