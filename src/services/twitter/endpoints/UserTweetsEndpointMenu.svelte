<script lang='ts'>
    import { getRootArticle, type ArticleWithRefs } from "articles";
    import { endpoints, type Endpoint } from "services/endpoints";
    import { addArticles, getServices } from "services/service";
    import type { TimelineData } from "timelines";
    import { parseResponse } from "../usertweets";

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

		addArticles(getServices()[endpoint.service], false, ...articles);

		if (endpoints[endpoint.name] !== undefined)
			endpoints[endpoint.name].set(endpoint);

			if (articles.length) {
			const newAddedIdPairs = articles.map(a => getRootArticle(a).idPair)
			timeline.addedIdPairs.update(idPairs => {
				idPairs.push(...newAddedIdPairs)
				return idPairs
			})
			timeline.articles.update(idPairs => {
				idPairs.push(...newAddedIdPairs)
				return idPairs
			})
		}
	}
</script>

<button on:click={parseAPI}>Boop</button>