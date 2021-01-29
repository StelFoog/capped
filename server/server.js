// const http = require('http');
const express = require('express');
var process = require('process');
const {
	init,
	resetTokens,
	takeToken,
	releaseToken,
	availableTokens,
	heldTokens,
	getAllTokens,
	createUser,
	getStatus,
} = require('./tokenSystem');
const {
	SERVER_FRONT,
	TAKE_TOKEN,
	RESET_TOKENS,
	RELEASE_TOKEN,
	INSPECT_TOKENS,
	MAKE_USER,
	GET_STATUS,
} = require('../shared/constants');
// const DBG_UPDATE = 'dgb-update';
// const DBG_UNLOCK = 'dbg-unlock';
const PORT = '8080';
const PROXYHOST = process.env.PROXY || false;

// helper functions
function standardResponse(res, obj) {
	res.set({ 'Content-Type': 'application/json' });
	res.send(JSON.stringify(obj));
}

function expressLogger(req, _res, next) {
	console.log('Recived request { method:', req.method, ', url:', req.url, '}');
	next();
}

function expressParseBody(req, res, next) {
	let body = [];
	if (req.method != 'GET') {
		req
			.on('error', (err) => {
				console.error(err);
				res.status(500).send('Error reciving body');
			})
			.on('data', (chunk) => {
				body.push(chunk);
			})
			.on('end', () => {
				req.body = JSON.parse(Buffer.concat(body).toString());
				next();
			});
	} else next();
}

function onProxy(req, _res, next) {
	if (req.url.substring(0, PROXYHOST.length) === PROXYHOST)
		req.url = req.url.slice(PROXYHOST.length);
	next();
}

// var waitingForUpdate = false;
// function readyForUpdate(req, res, next) {
// 	if (!waitingForUpdate) next();
// 	else if (req.route.path === DBG_UNLOCK) next();
// 	else {
// 		console.log('Communication with server attempted and rejected');
// 		res.status(500).send('Server is in the proccess of updating and cannot be interacted with.');
// 	}
// }

const server = express();
console.log('Server start');
init(); // prepares server … loads all data to memory
console.log('Server initialized');
server.use(expressLogger);
// server.use(readyForUpdate);
server.use(expressParseBody);
if (PROXYHOST) server.use(onProxy);

// The running server
// TODO: there should probably be a SSE for when available tokens are updated
server.get(SERVER_FRONT, (_req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/html');
	res.end(
		'<h1>Capped Kistan Server</h1><br><p>This is a server; not a website ...so what are you doing here?</p>'
	);
});
// all of these could be rebuilt since they all do bacically the same things
server.post(TAKE_TOKEN, (req, res) => {
	const args = req.body;
	const status = takeToken(...args);
	standardResponse(res, status);
});
server.post(RELEASE_TOKEN, (req, res) => {
	const args = req.body;
	const status = releaseToken(...args);
	standardResponse(res, status);
});
server.post(RESET_TOKENS, (req, res) => {
	const args = req.body;
	const status = resetTokens(...args);
	standardResponse(res, status);
});
server.post(INSPECT_TOKENS, (req, res) => {
	const args = req.body;
	const status = getAllTokens(...args);
	standardResponse(res, status);
});
server.post(MAKE_USER, (req, res) => {
	const args = req.body;
	const status = createUser(...args);
	standardResponse(res, status);
});
server.post(GET_STATUS, (req, res) => {
	const args = req.body;
	const status = getStatus(...args);
	standardResponse(res, status);
});
// TODO: Veryfy user as ADMIN
// server.post(DBG_UPDATE, (_req, res) => {
// 	waitingForUpdate = true;
// 	res.set({ 'Content-Type': 'application/json' });
// 	res.status(200).send('"Set for update"');
// });
// server.post(DBG_UNLOCK, (_req, res) => {
// 	waitingForUpdate = false;
// 	res.set({ 'Content-Type': 'application/json' });
// 	res.status(200).send('"Update canceled, server unlocked"');
// });

// Should maybe so some handling like closing the server and awaiting all requests to resolve.
// Maybe also save memory to datafile?
process.on('SIGINT', () => {
	console.log('\nInteruption, bye!');
	process.exit(0);
});
process.on('SIGTERM', () => {
	console.log('\nTermination, bye!');
	process.exit(0);
});

server.listen(PORT, () => console.log('Server listening at port', PORT));
