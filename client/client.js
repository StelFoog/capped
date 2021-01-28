const fetch = require('node-fetch');
const {
	GET,
	POST,
	TAKE_TOKEN,
	RESET_TOKENS,
	RELEASE_TOKEN,
	INSPECT_TOKENS,
	MAKE_USER,
	GET_STATUS,
} = require('../shared/constants');
const PORT = 8080;
const serverURL = 'http://localhost:' + PORT;

async function takeToken(user) {
	const body = [user];
	console.log(serverURL + TAKE_TOKEN);
	const res = await fetch(serverURL + TAKE_TOKEN, {
		method: POST,
		body: JSON.stringify(body),
	})
		.then((response) => response.json())
		.then((data) => data)
		.catch((error) => console.log(error));
	console.log(res);
}

async function resetTokens(user) {
	const body = [user];
	// console.log(JSON.stringify(body));
	const res = await fetch(serverURL + RESET_TOKENS, {
		method: POST,
		body: JSON.stringify(body),
	})
		.then((response) => response.json())
		.then((data) => data)
		.catch((error) => console.log(error));
	console.log(res);
}

async function releaseToken(user) {
	const body = [user];
	// console.log(JSON.stringify(body));
	const res = await fetch(serverURL + RELEASE_TOKEN, {
		method: POST,
		body: JSON.stringify(body),
	})
		.then((response) => response.json())
		.then((data) => data)
		.catch((error) => console.log(error));
	console.log(res);
}

async function inspectTokens(user) {
	const body = [user];
	// console.log(JSON.stringify(body));
	const res = await fetch(serverURL + INSPECT_TOKENS, {
		method: POST,
		body: JSON.stringify(body),
	})
		.then((response) => response.json())
		.then((data) => data)
		.catch((error) => console.log(error));
	console.log(res);
}

async function createUser(user, subjectName, subjectRank) {
	const body = [user, subjectName, subjectRank];
	// console.log(JSON.stringify(body));
	const res = await fetch(serverURL + MAKE_USER, {
		method: POST,
		body: JSON.stringify(body),
	})
		.then((response) => response.json())
		.then((data) => data)
		.catch((error) => console.log(error));
	console.log(res);
}

async function getStatus(user) {
	const body = [user];
	const res = await fetch(serverURL + GET_STATUS, {
		method: POST,
		body: JSON.stringify(body),
	})
		.then((response) => response.json())
		.then((data) => data)
		.catch((error) => console.log(error));
	console.log(res);
}

async function callOnUpdate(user) {
	const body = [user];
	const res = await fetch(serverURL + '/dbg-update', {
		method: POST,
		body: JSON.stringify(body),
	})
		.then((response) => response.json())
		.then((data) => data)
		.catch((error) => console.log(error));
	console.log(res);
}

// Testing
const args = JSON.parse(JSON.stringify(process.argv));
args.splice(0, 2);
switch (args.shift()) {
	case 'take':
		takeToken(...args);
		break;
	case 'release':
		releaseToken(...args);
		break;
	case 'reset':
		resetTokens(...args);
		break;
	case 'inspect':
		inspectTokens(...args);
		break;
	case 'make':
		createUser(...args);
		break;
	case 'status':
		getStatus(...args);
		break;
	case 'update':
		callOnUpdate(...args);
		break;
	default:
		console.log('No recognised command:', process.argv[2]);
}
