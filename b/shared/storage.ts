import { AnyChannel, Client, Message, MessageAttachment, TextChannel } from 'discord.js';
require('dotenv').config();

class DiscordStore {
	client = new Client({
		intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'],
	});
	channel: AnyChannel | undefined;
	constructor() {
		this.client.on('ready', () => {
			console.log('dc logged in');
			this.channel = this.client.channels.cache.get(process.env.DC_CHANNEL_ID!);
		});
		this.client.login(process.env.DC_TOKEN);
	}
	async _handleFile(req: any, file: Express.Multer.File, cb: any) {
		const msgAtt = new MessageAttachment(file.stream, file.originalname);
		const msgOptions = { content: file.filename, files: [msgAtt] };
		let res: Message<boolean>;
		console.log('scdsc3322223');
		while (true) {
			try {
				res = await (this.channel as TextChannel).send(msgOptions);
				console.log('scdsc35555322223');
				break;
			} catch (err) {}
		}
		cb(null, { path: res.attachments.first()!.url });
	}
	_removeFile(req: any, file: any, cb: any) {}
}

export default new DiscordStore();
