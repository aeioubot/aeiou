module.exports = async (client, payload) => {
	try {
		const toReload = client.registry.findGroups(payload.cmdOrGrp)[0] || client.registry.findCommands(payload.cmdOrGrp)[0];
		toReload.reload();
		return true;
	} catch (e) {
		console.log(`Shard ${client.shard.id} failed to reload ${payload.cmdOrGrp}.`);
		console.log(e);
		return false;
	}
};
