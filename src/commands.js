const child_process = require('child_process');
const regex = require('./regex.js');

const fs = require('fs');
const { PATH } = require('./settings.js');
const isAtHome = fs.existsSync(PATH);

function getCommandPath(cmd) {
  // todo: safer concat
  // note: implicitly sanitized for now (validateCommandName)
  // note: commands could also contain any symbols, if replaced by UUIDs or something
  validateCommandName(cmd.name);
  const path = `commands/${cmd.name}`;
  return path;
}

function createCommandEnv(originalEnv, msg) {
  const childenv = Object.assign({}, originalEnv);
  const auth = msg.author;
  childenv.BOTTLE_USER_ID = auth.id;
  childenv.BOTTLE_USER_TAG = `${auth.username}#${auth.discriminator}`;
  if (isAtHome) {
    childenv.BOTTLE_HOME_PATH = '.';
  }
  return childenv;
}

function runCommand(cmd, msg, settings) {
  const promise = new Promise((resolve, reject) => {  
    // spawn the command
    const cmdargs = cmd.args;
    const proc = child_process.execFile(
      getCommandPath(cmd),
      cmdargs,
      { env: createCommandEnv(process.env, msg),
        stdio: 'pipe', windowsHide: true },
      (error, stdout, stderr) => {
        // note: what if they never stop?
        // note: exit code on close/error?
        // note: stdin?
        if (stderr.length) {
          console.error(stderr);
        }
        if (error) {
          console.error(error);
          reject(stderr);
        } else {
          resolve(stdout);
        }
      }
    );
  });
  return promise;
}

function parseCommand(msg, settings) {
  const cleanText = getCleanText(msg, settings);
  const [name, ...args] = cleanText.split(/\s+/);
  // todo: "parse, don't validate"
  validateCommandName(name);
  const cmd = {name: name, args: args};
  return cmd;
}

function validateCommandName(name) {
  if (name.includes('/') || name.includes('.') || name.includes('\\')) {
    throw "Invalid command name! (Dangerous)";
  }
  // note: command names can include spaces (shop buy, shop sell, ...)
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
  // todo: not reply?
  const output = await runCommand(cmd, msg, settings);
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

