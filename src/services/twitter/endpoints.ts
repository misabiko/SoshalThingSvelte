import {TwitterService} from './service';
import {Endpoint, RefreshType} from '../endpoints';
import type {EndpointConstructorInfo} from '../endpoints';
import {fetchExtension} from '../extension';
import { parseHTMLArticle } from './page';
import type { ArticleWithRefs } from 'articles';
import TwitterUserTweetsAPIEndpoint from './endpoints/websocket/UserTweetsAPI';
import TwitterForYouTimelineAPIEndpoint from './endpoints/websocket/ForYouTimelineAPI';
import TwitterListAPIEndpoint from './endpoints/websocket/ListAPI';
import TwitterFollowingTimelineAPIEndpoint from './endpoints/websocket/FollowingTimelineAPI';
import TwitterUserMediaAPIEndpoint from './endpoints/websocket/UserMediaAPI';
import UserTweetsAPI, { TimelineType } from './endpoints/domainEndpoints/UserTweetsAPI';
import type { TwitterUser } from './article';
import ListAPI from './endpoints/domainEndpoints/ListAPI';
import TimelineAPI from './endpoints/domainEndpoints/TimelineAPI';

export class TwitterHomeEndpoint extends Endpoint {
	readonly service = TwitterService.name;
	readonly name = 'Home Page';

	async refresh(_refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		const listTabsResponse = await fetchExtension<any>('listTabs', {query: {url: '*://twitter.com/*'}});

		let tabId: number;
		if (Array.isArray(listTabsResponse) && listTabsResponse.length > 0)
			tabId = listTabsResponse[0].id;
		else
			throw new Error('No Twitter tab found');

		const pageResponse = await fetchExtension<any>('twitterFetch', {tabId, message: {
			soshalthing: true,
			request: 'getPageHTML',
		}});
		const html = document.createElement('html');
		html.innerHTML = pageResponse;
		const articlesHTML = html.getElementsByTagName('article');

		const articles = [];
		for (const articleHTML of articlesHTML) {
			try {
				const article = parseHTMLArticle(articleHTML);
				if (article === null)
					continue;
				articles.push(article);
			}catch (error) {
				console.error('Error parsing article', error, articleHTML);
			}
		}
		return articles;
	}

	matchParams(_params: any): boolean {
		return true;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'TwitterHomeEndpoint',
		paramTemplate: [],
		constructor: _params => new TwitterHomeEndpoint()
	};
}


TwitterService.endpointConstructors.push(
	TwitterHomeEndpoint.constructorInfo,					//0
	TwitterUserTweetsAPIEndpoint.constructorInfo,			//1
	TwitterForYouTimelineAPIEndpoint.constructorInfo,		//2
	TwitterFollowingTimelineAPIEndpoint.constructorInfo,	//3
	TwitterListAPIEndpoint.constructorInfo,					//4
	TwitterUserMediaAPIEndpoint.constructorInfo,			//5
	TimelineAPI.constructorInfo,							//6
	UserTweetsAPI.constructorInfo,							//7
	ListAPI.constructorInfo,								//8
);

TwitterService.userEndpoint = user => new UserTweetsAPI(TimelineType.Media, user.username, (user as TwitterUser).id);