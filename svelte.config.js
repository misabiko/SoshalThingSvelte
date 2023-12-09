export default {
	dev: process.env.NODE_ENV === 'development',	//TODO process.env not parsed
	css: 'injected', //TODO svelte5 Probably temporary while we wait for svelte-preprocess to work
	runes: true,
};