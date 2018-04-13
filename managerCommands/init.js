module.exports = async (manager) => {
	await require('../utils/models/plants.js').startTimer().then(() => console.log('[Manager] All plant timers started!'));
	return;
};
