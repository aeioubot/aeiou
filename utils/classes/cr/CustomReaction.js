const validTypes = ['whole', 'partial', 'template', 'templatePartial'];

class CustomReaction {
	constructor(type, trigger, content) {
		if (!validTypes.includes(type)) throw new Error(`The reaction (trigger: ${trigger}) did not have a valid type.`);
		this.type = type;
		this.trigger = trigger;
		this.contents = [content];
	}

	// Getters/Setters
	getTrigger() {
		return this.trigger;
	}

	getContents() {
		return this.contents;
	}
	// End getters/setters

	// Next 3 methods are private/utility
	removeMarkdown(text) { // Removes the markdown from a string, returns the stripped text and the MD beginning.
		let mdBeginning = '';
		while ('~`*_'.includes(text[0]) && text[0] === text[text.length - 1]) {
			mdBeginning += text[0];
			text = text.substring(1, text.length - 1);
		}
		return {md: mdBeginning, text: text};
	}

	escapeRegex(s) {
		return s.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
	}

	upify(text) { // Can't have capital custom emojis so you need a special .toUpperCase().
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

	isMatch(msg) { // Function to tell if any given message matches this CR, runs every message so SPEED over EVERYTHING else.
		let text = msg.content;
		text = this.removeMarkdown(text).text.toLowerCase();
		switch (this.type) {
			case 'whole': return text === this.trigger.toLowerCase(); // Regular CR.
			case 'partial': return text.toLowerCase().includes(this.trigger.toLowerCase()); // Partial match, i.e. "aeiou" in "the aeiou is cool"
			case 'templatePartial': return new RegExp('\\b' + this.escapeRegex(this.trigger).replace(/\\{[1-9]\\}/gi, '(.+)') + '\\b', 'gm').test(text); // Above + supports wildcards
			case 'template': return new RegExp('^' + this.escapeRegex(this.trigger).replace(/\\{[1-9]\\}/gi, '(.+)') + '$', 'gm').test(text); // Supports wildcards.
		}
	}

	react(msg) {
		switch (this.type) {
			case 'whole': {
				const {text, md} = this.removeMarkdown(msg.content);
				return msg.channel.send(
					`${md}${text === this.upify(text) ? this.upify(this.pickResponse()) : this.pickResponse()}${md.split('').reverse().join('')}`
				);
			}
			case 'partial': {
				const {md} = this.removeMarkdown(msg.content);
				return msg.channel.send(
					`${md}${msg.content === this.upify(msg.content) ? this.upify(this.pickResponse()) : this.pickResponse()}${md.split('').reverse().join('')}`
				);
			}
			case 'template': {
				const {md} = this.removeMarkdown(msg.content);
				let r = this.pickResponse();
				const messageReplacements = new RegExp('^' + this.escapeRegex(this.trigger).replace(/\\{[1-9]\\}/gi, '(.+)') + '$', 'gim').exec(msg.content);
				const responseTemplates = r.match(/{[1-9]}/g);
				if (responseTemplates) {
					responseTemplates.forEach(cTemplate => {
						r = r.replace(cTemplate, messageReplacements[cTemplate.charAt(1)] || '');
					});
				}
				return msg.channel.send(
					`${md}${msg.content === this.upify(msg.content) ? this.upify(r) : r}${md.split('').reverse().join('')}`
				);
			}
			case 'templatePartial': {
				const {md} = this.removeMarkdown(msg.content);
				let r = this.pickResponse();
				const messageReplacements = new RegExp('\\b' + this.escapeRegex(this.trigger).replace(/\\{[1-9]\\}/gi, '(.+)') + '\\b', 'gim').exec(msg.content);
				r.match(/{[1-9]}/g).forEach(cTemplate => {
					r = r.replace(cTemplate, messageReplacements[cTemplate.charAt(1)] || '');
				});
				return msg.channel.send(
					`${md}${msg.content === this.upify(msg.content) ? this.upify(r) : r}${md.split('').reverse().join('')}`
				);
			}
		}
	}
}

module.exports = CustomReaction;
