module.exports = async (manager) => {
	await require('../utils/models/creact.js').buildReactCache().then(() => console.log('[Manager] Reactions cache built!'));
	await require('../utils/models/plants.js').startTimer().then(() => console.log('[Manager] All plant timers started!'));
	return;
};
