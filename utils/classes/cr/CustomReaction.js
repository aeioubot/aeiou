const validTypes = ['whole', 'partial', 'template', 'react'];

class CustomReaction {
	constructor(type, trigger, content) {
		if (!validTypes.includes(type)) throw new Error(`The reaction (trigger: ${trigger}) did not have a valid type.`);
		this.type = type;
		this.trigger = trigger;
		if (this.type === 'template') this.triggerRegExp = new RegExp(this.escapeRegex(this.trigger).replace(/\\{[1-9]\\}/gi, '(.+)'), 'g');
		this.contents = [content];
	}

	// Getters/Setters
	getTrigger() {
		return this.trigger;
	}
	// End getters/setters

	// Next 3 methods are private/utility
	removeMarkdown(text) {
		while ('~`*_'.includes(text[0]) && text[0] === text[text.length - 1]) text = text.substring(1, text.length - 1);
		return text;
	}

	escapeRegex(s) {
		return s.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
	}

	upify(text) {
		text = text.split('');
		let upping = true;
		for (let i = 0; i < text.length; i++) {
			if (upping) text[i] = text[i].toUpperCase();
			if (text[i] == '<') upping = false;
			if (text[i] == '>') upping = true;
		}
		return text.join('');
	}

	pickResponse() {
		return this.contents[Math.floor(Math.random() * this.contents.length)];
	}
	// End private

	addAltContent(text) {
		this.contents.push(text);
	}

	isMatch(msg) {
		let text = msg.content;
		text = this.removeMarkdown(text).toLowerCase();
		switch (this.type) {
			case 'whole': return text === this.trigger.toLowerCase();
			case 'partial': return text.toLowerCase().includes(this.trigger.toLowerCase());
			case 'template': return this.triggerRegExp.test(text);
			case 'react': return text === this.trigger.toLowerCase();
		}
	}

	react(msg) {
		switch (this.type) {
			case 'whole': {
				let contentClone = msg.content;
				let mds = '';
				while ('~`*_'.includes(contentClone[0]) && contentClone[0] === contentClone[contentClone.length - 1]) {
					mds += contentClone[0];
					contentClone = contentClone.substring(1, contentClone.length - 1);
				}
				return msg.channel.send(
					`${mds}${contentClone === this.upify(contentClone) ? this.upify(this.pickResponse()) : this.pickResponse()}${mds.split('').reverse().join('')}`
				);
			}
			case 'partial': {
				// TODO
				break;
			}
			case 'template': {
				const r = this.pickResponse();
				// this.removeMarkdown(msg.content).toLowerCase()
				const messageReplacements = this.triggerRegExp.exec(msg.content);
				console.log(messageReplacements)
				r.match(/{[1-9]}/g).forEach(cTemplate => {
					r.replace(new RegExp('\\' + cTemplate, 'g'), messageReplacements[parseInt(cTemplate[1])]);
				});
				return msg.channel.send(r);
			}
			case 'react': {
				// TODO
				break;
			}
		}
	}
}

module.exports = CustomReaction;
