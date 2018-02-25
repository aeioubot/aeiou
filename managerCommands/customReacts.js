const creacts = require('../utils/models/creact.js');

module.exports = (manager, shard, guildsArray) => {
	sendCRs = {};
	guildsArray.forEach((id) => {
		sendCRs[id] = creacts.allGuildReactions[id];
		delete creacts.allGuildReactions[id];
	});
	if (Object.keys(creacts.allGuildReactions).length === 0) console.log('[Manager] Reactions cache empty!');
	return shard.send({command: 'customReacts', data: sendCRs, guilds: guildsArray.length});
};
