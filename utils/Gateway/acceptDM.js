module.exports = async function(client, payload) {
	return client.dmManager.reply(payload.replyID, payload.msg, payload.opts);
};
