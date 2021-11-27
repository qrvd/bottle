const commands = require('./src/commands.js');
const userdata = require('./src/userdata.js');
const settings = require('./src/settings.js');
const discord = require('discord.js');

settings.ensureSettingsExist().then(() => {

  const set = settings.get();
  const client = new discord.Client(set['discord.js']);

  client.once('ready', async () => {
    console.error(`Logged in as ${client.user.username}!`);
    await userdata.init(client.user);
    commands.inject(client, set);
  });

  console.error('Starting bot...');
  client.login(set.token);
});

