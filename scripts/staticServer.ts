import path from 'path';
import { ServerWebSocket } from 'bun';
import { ClientData, onClose, onMessage } from './twitterScrape';

let port = 8080;
const portIndex = process.argv.findIndex(s => s === '--port');
if (portIndex > -1 && process.argv.length >= portIndex)
	port = parseInt(process.argv[portIndex + 1]);

const clients: { [id: number]: ServerWebSocket<ClientData> } = {};

process.on("SIGINT", () => {
	console.log("Ctrl-C was pressed");
	process.exit();
});

Bun.serve<ClientData>({
	port,
	async fetch(req, server) {
		//if websocket
		if (server.upgrade(req, { data: {} }))
			return undefined;

		const url = new URL(req.url + (new URL(req.url).pathname === '/' ? 'index.html' : ''))
		const filePath = path.join('dist', url.pathname);
		const file = Bun.file('./' + filePath);

		return new Response(file);
	},
	websocket: {
		open(ws) {
			console.log('New websocket connection');
			let i = Object.keys(clients).length;
			while (Object.hasOwn(clients, i))
				++i;

			clients[i] = ws;
			ws.data.id = i;
		},
		message(ws, message) {
			onMessage(ws, message as string, clients);
		},
		close(ws) {
			onClose(ws, clients);
			delete clients[ws.data.id];
		}
	},
});

console.log(`Listening on http://localhost:${port}`);