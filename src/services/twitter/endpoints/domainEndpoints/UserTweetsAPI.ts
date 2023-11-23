import { type Instruction } from 'services/twitter/pageAPI';
import APIEndpoint, { type APIParams } from './APIEndpoint';

export default class UserTweetsAPI extends APIEndpoint<UserTweetsResponse> {
	readonly name: string;
	readonly endpointPath: string;

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
	}

	matchParams(_params: any): boolean {
		throw new Error('Method not implemented.');
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
}

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

interface UserTweetsAPIParams extends APIParams {
	variables: {
		userId: string
		withVoice: boolean
		withQuickPromoteEligibilityTweetFields?: boolean
		withV2Timeline?: boolean
	}
}