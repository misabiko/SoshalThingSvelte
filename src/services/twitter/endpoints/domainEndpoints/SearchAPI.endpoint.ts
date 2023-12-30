import type { Instruction } from '~/services/twitter/pageAPI';
import APIEndpoint, { type APIParams } from './APIEndpoint';
import type { EndpointConstructorInfo } from '~/services/endpoints';
import {registerEndpointConstructor} from '~/services/service';
import {TwitterService} from '../../service';

export default class SearchAPI extends APIEndpoint<SearchTimelineResponse> {
	static service = TwitterService.name;
	readonly name: string;
	readonly endpointPath: string;
	readonly params;

	constructor(readonly query: string) {
		super();

		this.name = 'SearchAPI(' + query + ')';
		this.endpointPath = 'Aj1nGkALq99Xg3XI0OZBtw/SearchTimeline';

		this.params = {
			query,
		};
	}

	matchParams(params: any): boolean {
		return params.query === this.query;
	}

	getInstructions(data: SearchTimelineResponse): Instruction[] {
		return data.data.search_by_raw_query.search_timeline.timeline.instructions;
	}

	fetchParams(): APIParams {
		const { variables, features } = super.fetchParams();
		return {
			variables: {
				...variables,
				rawQuery: this.query,
				product: 'Latest',
				// querySource: 'hashtag_click'
			},
			features: {
				...features,
				rweb_video_timestamps_enabled: false,
			},
		};
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'TwitterSearchAPI',
		paramTemplate: [['query', '']],
		constructor: ({query}) => new SearchAPI(query as string)
	};
}

registerEndpointConstructor(SearchAPI);

type SearchTimelineResponse = {
	data: {
		search_by_raw_query: {
			search_timeline: {
				timeline: {
					instructions: Instruction[]
				}
			}
		}
	}
};

// interface SearchAPIParams extends APIParams {
// 	variables: {
// 		rawQuery: string
// 		product: 'Latest',
// 		querySource: 'hashtag_click'
// 	}
// }