const subprocess = require('./subprocess.js');
const userdata = require('./userdata.js');
const regex = require('./regex.js');

const fs = require('fs');
const { PATH } = require('./settings.js');
const isAtHome = fs.existsSync(PATH);

function parseCommand(msg, settings) {
  const cleanText = getCleanText(msg, settings);
  const [name, ...args] = cleanText.split(/\s+/);
  const cmd = {name: name, args: args};
  return cmd;
}

function getCleanText(msg, settings) {
  const prefixRegex = new RegExp('^' + regex.escape(settings.prefix));
  return msg.content.replace(prefixRegex, '');
}

function isCommand(msg, settings) {
  const prefix = settings.prefix;
  return prefix
    && msg.content.startsWith(prefix)
    && msg.content !== prefix;
}

async function triggerCommand(msg, settings) {
  const cmd = parseCommand(msg, settings);
  const cmdUser = userdata.buildCommandUser(msg.author);
  const output = await subprocess.execCommand(cmd, cmdUser);
  // todo: not reply?
  await msg.reply(output);
}

function inject(client, settings) {
  client.on('messageCreate', async (msg) => {
    if (msg.author.id === client.user.id) {
    } else if (isCommand(msg, settings)) {
      // todo: lock handlers so that only one per user is running at a time
      await triggerCommand(msg, settings);
    } else {
      // Non-command?
    }
  });
}

module.exports = {
  trigger: triggerCommand,
  isCommand: isCommand,
  inject: inject
};

