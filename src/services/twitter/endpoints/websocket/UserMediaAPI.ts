import type { EndpointConstructorInfo } from 'services/endpoints';
import { parseResponse, type Instruction } from '../../pageAPI';
import WebSocketPageEndpoint from './WebSocketPageEndpoint';

export default class TwitterUserMediaAPIEndpoint extends WebSocketPageEndpoint {
	readonly name: string;

	constructor(username: string) {
		const name = `TwitterUserMediaAPIEndpoint(${username})`;
		super({
			initEndpoint: name,
			responseIncludes: '/UserMedia',
			gotoURL: `https://twitter.com/${username}/media`,
		});

		this.name = name;
	}

	matchParams(_params: any): boolean {
		return true;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'TwitterUserMediaAPIEndpoint',
		paramTemplate: [['username', '']],
		constructor: ({username}) => new TwitterUserMediaAPIEndpoint(username as string)
	};

	async parseResponse(data: UserMediaResponse) {
		return parseResponse(data.data.user.result.timeline_v2.timeline.instructions);
	}
}

type UserMediaResponse = {
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