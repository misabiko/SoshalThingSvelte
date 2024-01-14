<script lang='ts'>
    import { getRootArticle, type ArticleWithRefs } from 'articles';
    import { endpoints, type Endpoint } from 'services/endpoints';
    import { addArticles } from 'services/service';
    import { parseResponse } from 'services/twitter/pageAPI';
	import {addArticlesToTimeline, type TimelineData} from 'timelines';

	export let timeline: TimelineData;
	export let endpoint: Endpoint;

	async function parseAPI() {
		let parsed = null;
		try {
			parsed = JSON.parse(await navigator.clipboard.readText());
		} catch (e) {
			console.error(e);
			return;
		}

		const articles: ArticleWithRefs[] = parseResponse(parsed);

		endpoint.articleIdPairs.push(...articles
			.map(a => getRootArticle(a).idPair)
			.filter(idPair => !endpoint.articleIdPairs
				.some(pair =>
					pair.service === idPair.service &&
					pair.id === idPair.id,
				)
			)
		);

		addArticles(false, ...articles);

		if (!Object.hasOwn(endpoints, endpoint.name))
			endpoints[endpoint.name].set(endpoint);

		addArticlesToTimeline(timeline, ...articles.map(a => getRootArticle(a).idPair));
	}
</script>

<button on:click={parseAPI}>Boop</button>