const commands = require('./src/commands.js');
const userdata = require('./src/userdata.js');
const settings = require('./src/settings.js');
const discord = require('discord.js');

const client = new discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
  partials: ["CHANNEL"]
});

client.once('ready', async () => {
  console.error(`Logged in as ${client.user.username}!`);
  await userdata.init(client.user);
  commands.inject(client, settings.get());
});

settings.ensureSettingsExist().then(() => {
  console.error('Starting bot...');
  client.login(settings.get().token);
});

