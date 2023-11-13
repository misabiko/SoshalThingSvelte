const websocket = new WebSocket('ws://localhost:443');

websocket.addEventListener('error', e => console.error('Service Websocket Error: ', e));

websocket.addEventListener('open', () => {
	console.log('Connected Twitter service to websocket');
	websocket.send(JSON.stringify({
		// status: 'initService' would probably be cleaner
		initService: true,
	}));
});

export function sendRequest<T>(request: string, body: any): Promise<T> {
	websocket.send(JSON.stringify({request, body}));

	return new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => reject(new Error("Remote page didn't respond in 10 seconds.")), 10000);
		const listener = (data: MessageEvent) => {
			const json = JSON.parse(data.data);
			if (json.respondingTo !== request)
				return;

			clearTimeout(timeoutId);
			websocket.removeEventListener('message', listener);

			resolve(json.response);
		};

		websocket.addEventListener('message', listener);
	});
}