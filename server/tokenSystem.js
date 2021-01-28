const fs = require('fs');

const MAX_TOKENS = 40;
const DATA_PATH = 'server/data.json';

const SUC_TOKEN_TAKEN = 'S: A token was taken';
const SUC_TOKEN_RELEASED = 'S: A token was released';
const SUC_RESET_TOKENS = 'S: Tokens were reset';
const SUC_USER_CREATED = 'S: User successfully created';

const ERR_NO_SUCH_USER = 'E: Not valid user, no action taken';
const ERR_USER_NOT_PERMITTED = "E: User doesn't have permissions to do this, no action taken";
const ERR_NO_TOKENS_AVAILABLE = 'E: No tokens available, no token granted';
const ERR_NO_TOKENS_TO_RELEASE = 'E: User has no tokens, no token released';
const ERR_MISSING_ARGUMENT = 'E: Missing argument, no action taken';
const ERR_INVALID_ARGUMENT = 'E: INvalid argument, no action taken';

// user ranks
const USER_RANKS = ['ADMIN', 'REGULAR'];

var limitTokens = [];
var data = null;

function readData() {
	if (data) {
		console.log('data already loaded, did not read file');
		return;
	}
	fs.readFile('server/data.json', 'UTF-8', (error, dat) => {
		if (error) {
			console.log(error);
			return;
		}
		data = JSON.parse(dat);
	});
}

function writeData() {
	if (!data) {
		console.log('data not loaded, did not write file');
		return;
	}
	fs.writeFile('server/data.json', JSON.stringify(data), (err) => {
		if (err) console.log('Error writing file', err);
	});
}

function getUser(user) {
	if (data.users[user]) return data.users[user];
	else return false;
}

function tokensLeft() {
	return MAX_TOKENS - limitTokens.length;
}

function heldTokens(user) {
	if (!getUser(user)) return ERR_NO_SUCH_USER;
	var usersTokens = 0;
	limitTokens.forEach((token) => {
		if (token === user) usersTokens++;
	});
	return usersTokens;
}

function collectAbandonedTokens() {
	limitTokens.forEach((e) => {
		data.users[e].abandonedTokens++;
	});
}

function releaseFirstToken(user) {
	for (const [index, val] of limitTokens.entries()) {
		if (user === val) {
			limitTokens.splice(index, 1);
			return true;
		}
	}
	return false;
}

function makeSubject(user, subjectName, subjectRank) {
	const subject = {
		name: subjectName,
		rank: subjectRank,
		status: 'active',
		abandonedTokens: 0,
		liege: user,
	};
	data.users[subjectName] = subject;
	writeData();
}

function editSubject(subjectName, newInfo) {
	const subject = getUser(subjectName);
	const newSubject = { ...subject, ...newInfo };
	data.users[subjectName] = newSubject;
	writeData();
}

function cleanUser(user) {
	limitTokens = limitTokens.filter((e) => user !== e);
}

function fullStatus(user, message, val) {
	const status = {
		success: !message || message.charAt(0) === 'S',
		state: { availableTokens: tokensLeft() },
	};
	if (message) status.message = message;
	if (user) {
		status.state.heldTokens = heldTokens(user);
		status.state.userRank = getUser(user).rank;
	}
	if (val) status.val = val;
	return status;
	// return {
	// 	success: !message || message.charAt(0) === 'S',
	// 	message ? message : undefined,

	// }
	// if (!message) {
	// 	return {
	// 		success: true,
	// 		state: {
	// 			availableTokens: tokensLeft(),
	// 			heldTokens: heldTokens(user),
	// 		},
	// 	};
	// }
	// if (message.charAt(0) === 'S')
	// 	return {
	// 		success: true,
	// 		message,
	// 		state: {
	// 			availableTokens: tokensLeft(),
	// 			heldTokens: heldTokens(user),
	// 		},
	// 	};
	// else return { success: false, message };
}
// function errStatus(message) {
// 	return { success: false, message };
// }

module.exports = {
	init: () => {
		readData();
	},
	resetTokens: (user) => {
		if (typeof user !== 'string') return fullStatus(null, ERR_MISSING_ARGUMENT);
		if (!getUser(user)) return fullStatus(null, ERR_NO_SUCH_USER);
		cleanUser(user);
		collectAbandonedTokens();
		writeData();
		limitTokens = [];
		return fullStatus(user, SUC_RESET_TOKENS);
	},
	takeToken: (user) => {
		if (typeof user !== 'string') return fullStatus(null, ERR_MISSING_ARGUMENT);
		if (!getUser(user)) return fullStatus(null, ERR_NO_SUCH_USER);
		if (tokensLeft() <= 0) return fullStatus(user, ERR_NO_TOKENS_AVAILABLE);
		limitTokens.push(user);
		return fullStatus(user, SUC_TOKEN_TAKEN);
	},
	releaseToken: (user) => {
		if (typeof user !== 'string') return fullStatus(null, ERR_MISSING_ARGUMENT);
		if (!getUser(user)) return fullStatus(null, ERR_NO_SUCH_USER);
		if (!releaseFirstToken(user)) return fullStatus(user, ERR_NO_TOKENS_TO_RELEASE);
		return fullStatus(user, SUC_TOKEN_RELEASED);
	},
	getStatus: (user) => {
		if (!user) return fullStatus();
		if (typeof user !== 'string') return fullStatus(null, ERR_MISSING_ARGUMENT);
		if (!getUser(user)) return fullStatus(null, ERR_NO_SUCH_USER);
		return fullStatus(user);
	},
	availableTokens: tokensLeft,
	heldTokens: (user) => {
		if (typeof user !== 'string') return fullStatus(null, ERR_MISSING_ARGUMENT);
		if (!getUser(user)) return fullStatus(null, ERR_NO_SUCH_USER);
		heldTokens();
	},
	getAllTokens: (user) => {
		if (typeof user !== 'string') return fullStatus(null, ERR_MISSING_ARGUMENT);
		const userData = getUser(user);
		if (!userData) return fullStatus(null, ERR_NO_SUCH_USER);
		if (userData.rank !== 'ADMIN') return fullStatus(user, ERR_USER_NOT_PERMITTED);
		return fullStatus(user, null, limitTokens);
		// return { success: true, val: limitTokens };
	},
	createUser: (user, subjectName, subjectRank) => {
		if (typeof user !== 'string') return fullStatus(null, ERR_MISSING_ARGUMENT);
		const userData = getUser(user);
		if (!userData) return fullStatus(null, ERR_NO_SUCH_USER);
		if (userData.rank !== 'ADMIN') return fullStatus(user, ERR_USER_NOT_PERMITTED);
		if (typeof subjectName !== 'string') return fullStatus(user, ERR_MISSING_ARGUMENT);
		if (typeof subjectRank !== 'string') return fullStatus(user, ERR_MISSING_ARGUMENT);
		if (getUser(subjectName)) return fullStatus(user, ERR_INVALID_ARGUMENT);
		if (!USER_RANKS.includes(subjectRank)) return fullStatus(user, ERR_INVALID_ARGUMENT);
		makeSubject(user, subjectName, subjectRank);
		return fullStatus(user, null, getUser(subjectName));
		// return { success: true, val: getUser(subjectName) };
	},
	editUser: (user, subjectName, newInfo) => {
		if (typeof user !== 'string') return fullStatus(null, ERR_MISSING_ARGUMENT);
		const userData = getUser(user);
		if (!userData) return fullStatus(null, ERR_NO_SUCH_USER);
		if (userData.rank !== 'ADMIN') return fullStatus(user, ERR_USER_NOT_PERMITTED);
		if (typeof subjectName !== 'string') return fullStatus(user, ERR_MISSING_ARGUMENT);
		if (typeof subjectRank !== 'object') return fullStatus(user, ERR_MISSING_ARGUMENT);
		if (!getUser(subjectName)) return fullStatus(user, ERR_INVALID_ARGUMENT);
		editSubject(subjectName, newInfo);
		return fullStatus(user, null, getUser(subjectName));
		// return { success: true, val: getUser(subjectName) };
	},
};
