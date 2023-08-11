export async function tryInject(elementQuery: () => Element | null): Promise<Element> {
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
		}, 500);
	});
}