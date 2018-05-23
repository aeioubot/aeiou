module.exports = async function(client, payload) {
	return client.users.filterArray((u) => {
		return u.discriminator == payload.discrim;
	}).map(user => user.tag);
};
