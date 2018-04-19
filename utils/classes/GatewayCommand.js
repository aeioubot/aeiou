class GatewayCommand {
	constructor(source, command, destination, payload) {
		this.source = source;
		this.command = command;
		this.destination = destination;
		this.payload = payload;
		this.time = (new Date()).getTime();
	}
}

module.exports = GatewayCommand;
