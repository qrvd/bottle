const fs = require('fs');
const process = require('process');
const discord = require('discord.js');
const commands = require('./src/commands.js');
const userdata = require('./src/userdata.js');
const settings = require('./src/settings.js');

const client = new discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
  partials: ["CHANNEL"]
});

client.once('ready', async () => {
  console.error(`Logged in as ${client.user.username}!`);
  await userdata.init(client);
  // Start handling messages, now that the bot is ready
  commands.inject(client, settings.get());
});

client.login(settings.get().token);

