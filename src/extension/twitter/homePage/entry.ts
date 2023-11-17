import HomePage from './HomePage.svelte';

console.log('Twitter extension loaded');

async function tryInject(elementQuery: () => Element | null, delayMs = 500): Promise<Element> {
	let attempts = 0;
	let element: Element | null = null;
	return new Promise((resolve, reject) => {
		const intervalId = setInterval(() => {
			console.log('Check if we can inject...');
			element = elementQuery();
			if (element !== null) {
				clearInterval(intervalId);
				console.log('Injecting soshalthing...');
				resolve(element);
				return;
			}else
				++attempts;

			if (attempts >= 10) {
				clearInterval(intervalId);
				reject("Couldn't inject after 10 attempts");
			}
		}, delayMs);
	});
}

tryInject(() => {
	const target = document.querySelector('div[aria-label="Home timeline"]');
	if (target?.children[4] !== undefined)
		return target;
	else
		return null;
}, 2000)
	.then(target => {
		const anchor = target.children[4];
		if (!anchor)
			throw new Error("Couldn't find anchor");

		new HomePage({ target, anchor });
	});