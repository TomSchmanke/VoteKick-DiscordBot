const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require('./config.json');
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const BOT_TOKEN = config.BOT_TOKEN;
const CLIENT_ID = config.CLIENT_ID;

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);

(async () => {
	try {
		console.log(`Started refreshing application (/) commands.`);

		await rest.put(
			Routes.applicationGuildCommands(CLIENT_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

