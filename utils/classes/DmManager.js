const TOTAL_CACHE_COUNT = 10;
const DM_SERVER = '399999769159663628';
const DM_SERVER_CHANNEL = '423201568549240842';
const PERM_SERVER_INVITE = 'https://discord.gg/ARwbQvn';

class DmManager {
	constructor(client) {
		this.client = client;
		this.messages = [];
		this.id = 0;
		this.warnedUsers = [];
	}

	async newMessage(msg) {
		if (!this.messages.find((m) => msg.author.id == m.author.id)) {
			msg.replyID = this.id;
			this.id += 1;
			if (this.messages.push(msg) > TOTAL_CACHE_COUNT) this.messages.splice(0, 1);
		}
		if (!this.warnedUsers.includes(msg.author.id)) {
			msg.reply('**Notice!!!**: The owners of Aeiou have access to **only the DMs** (excluding commands) that you send to me.\n\nPlease do not send sensitive information, but please *do* send feedback or suggestions.');
			this.warnedUsers.push(msg.author.id);
		}
		const embed = {
			color: 0x4286F4,
			author: {
				name: `${msg.author.username}#${msg.author.discriminator}`,
				icon_url: msg.author.avatarURL ? msg.author.avatarURL : 'https://cdn.drawception.com/images/panels/2016/12-10/Q4Zcfan1X5-4.png',
			},
			image: {
				url: msg.attachments.first() && msg.attachments.first().height ? msg.attachments.first().url : '',
			},
			fields: [],
			footer: {text: `ID: ${this.messages.find((m) => msg.author.id == m.author.id).replyID}`},
		};
		if (msg.content && msg.content.length < 1024) embed.fields.push({name: 'Content', value: msg.content});
		if (msg.content && msg.content.length > 1024 ) {
			embed.fields.push({name: 'Content', value: msg.content.substring(0, 1024)});
			embed.fields.push({name: 'Content overflow', value: msg.content.substring(1024)});
		}
		this.client.guilds.get(DM_SERVER).channels.get(DM_SERVER_CHANNEL).send('New DM:', {embed});
		if (msg.attachments.first() && !msg.attachments.first().height) {
			this.client.guilds.get(DM_SERVER).channels.get(DM_SERVER_CHANNEL).send(`Additional attachment:\n${msg.attachments.first().url}`);
		}
	}

	async reply(replyID, content, msg) {
		const replyMsg = this.messages.find((m) => replyID == m.replyID);
		if (!replyMsg) return msg.say('I don\'t have a message cached by that ID.');
		return replyMsg.reply(content.replace('{s}', PERM_SERVER_INVITE), msg.attachments.first() && msg.attachments.first().height ? {embed: {image: {url: msg.attachments.first().url}}} : '').then(msg.react('✅'));
	}
}

module.exports = DmManager;
