const fs = require('fs');
const process = require('process');
const discord = require('discord.js');
const command = require('./src/command.js');
const userdata = require('./src/userdata.js');

const settings = JSON.parse(fs.readFileSync('./bottle.json'));
if (!settings.prefix) throw "prefix is not defined in bottle.json";
if (!settings.token) throw "token is not defined in bottle.json";
process.on('quit', () => fs.writeFileSync('./bottle.json', settings));

const client = new discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
  partials: ["CHANNEL"]
});

client.once('ready', async () => {
  console.error(`Logged in as ${client.user.username}!`);
  await userdata.init(client);
  // Start handling messages, now that the bot is ready
  commands.inject(client);
});

client.login(settings.token);

