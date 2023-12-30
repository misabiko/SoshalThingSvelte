import type { EndpointConstructorInfo } from '~/services/endpoints';
import UserTweetsEndpointMenu from './UserTweetsEndpointMenu.svelte';
import { parseResponse, type Instruction } from '../../pageAPI';
import WebSocketPageEndpoint from './WebSocketPageEndpoint';
import {TwitterService} from '../../service';

export default class TwitterUserTweetsAPIEndpoint extends WebSocketPageEndpoint {
	static service = TwitterService.name;
	readonly name: string;
	menuComponent = UserTweetsEndpointMenu;
	readonly params;

	constructor(username: string) {
		const name = `TwitterUserTweetsAPIEndpoint(${username})`;
		super({
			initEndpoint: name,
			responseIncludes: '/UserTweets',
			gotoURL: 'https://twitter.com/' + username
		});

		this.name = name;

		this.params = {
			username,
		};
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