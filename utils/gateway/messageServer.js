module.exports = async function(client, payload) {
	client.guilds.get(payload.guild).channels.get(payload.channel).send(payload.msg, payload.opts);
	return true;
};
