import express from 'express';

const app = express();

let port = 8080;
const portIndex = process.argv.findIndex(s => s === '--port');
if (portIndex > -1 && process.argv.length >= portIndex)
	port = parseInt(process.argv[portIndex + 1]);

app.use(express.static('dist'));

app.listen(port, () => console.log(`Listening on port ${port}`));