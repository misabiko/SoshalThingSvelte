import type { EndpointConstructorInfo } from 'services/endpoints';
import { TwitterService } from '../../service';
import UserTweetsEndpointMenu from './UserTweetsEndpointMenu.svelte';
import { parseResponse, type Instruction } from '../../pageAPI';
import WebSocketPageEndpoint from './WebSocketPageEndpoint';

export default class TwitterUserTweetsAPIEndpoint extends WebSocketPageEndpoint {
	readonly service = TwitterService.name;
	readonly name: string;
	menuComponent = UserTweetsEndpointMenu;

	constructor(username: string) {
		const name = `TwitterUserTweetsAPIEndpoint(${username})`;
		super({
			initEndpoint: name,
			responseIncludes: '/UserTweets',
			gotoURL: 'https://twitter.com/' + username
		});

		this.name = name;
	}

	matchParams(_params: any): boolean {
		return true;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'TwitterUserTweetsAPIEndpoint',
		paramTemplate: [['username', '']],
		constructor: ({username}) => new TwitterUserTweetsAPIEndpoint(username as string)
	};

	async parseResponse(data: UserTweetsResponse) {
		return parseResponse(data.data.user.result.timeline_v2.timeline.instructions);
	}
}

type UserTweetsResponse = {
	data: {
		user: {
			result: {
				timeline_v2: {
					timeline: {
						instructions: Instruction[]
						metadata: object
					}
				}
			}
		}
	}
};