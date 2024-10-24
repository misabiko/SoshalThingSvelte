import { loadMainStorage } from '~/storages';

//Websocket no-connection error is not catcheable, and will be flagged as extension error no matter what, so better to make ws opt-in
//https://stackoverflow.com/a/31003057/2692695
let websocket: WebSocket | null = null;

if (loadMainStorage().useWebSocket) {
	websocket = new WebSocket('ws://localhost:443');

	websocket.addEventListener('error', e => console.error('Service Websocket Error: ', e));

	websocket.addEventListener('open', () => {
		if (websocket === null)
			throw new Error('Websocket not initialized');

		//TODO Make service agnostic
		console.debug('Connected service to websocket');
		websocket.send(JSON.stringify({
			// status: 'initService' would probably be cleaner
			initService: true,
		}));
	});
}

export function sendRequest<T>(request: string, body: any): Promise<T> {
	if (websocket === null)
		throw new Error('Websocket not initialized');

	websocket.send(JSON.stringify({request, body}));

	return new Promise((resolve, reject) => {
		if (websocket === null)
			throw new Error('Websocket not initialized');

		const timeoutId = setTimeout(() => reject(new Error("Remote page didn't respond in 10 seconds.")), 10000);
		const listener = (data: MessageEvent) => {
			if (websocket === null)
				throw new Error('Websocket not initialized');

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