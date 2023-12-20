import { type Instruction } from 'services/twitter/pageAPI';
import APIEndpoint, { type APIParams } from './APIEndpoint';
import type { EndpointConstructorInfo } from 'services/endpoints';
import {getServices, registerEndpointConstructor} from '../../../service';
import {TwitterService} from '../../service';
import type {TwitterUser} from '../../article';

export default class UserTweetsAPI extends APIEndpoint<UserTweetsResponse> {
	static service = TwitterService.name;
	readonly name: string;
	readonly endpointPath: string;
	readonly params;

	constructor(readonly timelineType: TimelineType, readonly username: string, readonly userId: string) {
		super();

		switch (timelineType) {
			case TimelineType.Tweets:
				this.name = 'UserTweetsAPI(' + username + ')';
				this.endpointPath = 'VgitpdpNZ-RUIp5D1Z_D-A/UserTweets';
				break;
			case TimelineType.Media:
				this.name = 'UserMediaAPI(' + username + ')';
				this.endpointPath = '7_ZP_xN3Bcq1I2QkK5yc2w/UserMedia';
				break;
			default:
				throw new Error('Unsupported timeline type');
		}

		this.params = {
			username,
			userId,
			media: timelineType === TimelineType.Media,
		};
	}

	matchParams(params: any): boolean {
		return params.username === this.username;
	}

	getInstructions(data: UserTweetsResponse): Instruction[] {
		return data.data.user.result.timeline_v2.timeline.instructions;
	}

	fetchParams(): APIParams {
		const { variables, features } = super.fetchParams();
		return {
			variables: {
				...variables,
				userId: this.userId,
				// count: number,
				// withQuickPromoteEligibilityTweetFields: true,
				withVoice: false,
				//withV2Timeline is optional and false by default, but we parse in v2 anyway
				withV2Timeline: true,
			},
			features,
		};
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'TwitterUserTweetsAPI',
		paramTemplate: [
			['username', ''],
			['userId', ''],
			['media', false]
		],
		constructor: ({username, userId, media}) => new UserTweetsAPI(
			media ? TimelineType.Media : TimelineType.Tweets,
			username as string,
			userId as string
		),
	};
}

registerEndpointConstructor(UserTweetsAPI);
getServices()[TwitterService.name].userEndpoint = user => new UserTweetsAPI(TimelineType.Media, user.username, (user as TwitterUser).id);

export enum TimelineType {
	Tweets,
	//Replies,
	Media,
	//Likes,
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

// interface UserTweetsAPIParams extends APIParams {
// 	variables: {
// 		userId: string
// 		withVoice: boolean
// 		withQuickPromoteEligibilityTweetFields?: boolean
// 		withV2Timeline?: boolean
// 	}
// }