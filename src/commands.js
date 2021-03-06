const subprocess = require('./subprocess.js');
const userdata = require('./userdata.js');
const regex = require('./regex.js');

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
  const output = (await subprocess.execCommand(cmd, cmdUser)).trim();
  if (output.length > 0) {
    // todo: not reply?
    await msg.reply(output);
  }
}

function inject(client, settings) {
  client.on('messageCreate', async (msg) => {
    if (msg.author.id === client.user.id) {
      // Bot-command
    } else if (isCommand(msg, settings)) {
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

