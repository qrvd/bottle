const fs = require('fs');
const process = require('process');
const child_process = require('child_process');
const regex = require('./src/regex.js');
const discord = require('discord.js');
const { Mutex } = require('async-mutex');

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
  await initBot(client);

  // Start handling messages, now that the bot is ready
  // todo: lock handlers so that only one per user is running at a time
  client.on('messageCreate', async (msg) => {
    if (msg.author.id === client.user.id) {
    } else if (isCommand(msg, settings)) {
      await triggerCommand(msg, settings);
    } else {
      // Non-command?
    }
  });

});

async function triggerCommand(msg, settings) {
  const cmd = parseCommand(msg, settings);
  // todo: reply?
  const output = await runCommand(cmd, msg, settings);
  msg.reply(output);
}

function getCommandPath(cmd) {
  // todo: safer concat
  // note: implicitly sanitized for now (validateCommandName)
  // note: commands could also contain any symbols, if replaced by UUIDs or something
  validateCommandName(cmd.name);
  const path = `commands/${cmd.name}`;
  return path;
}

function createCommandEnv(originalEnv, msg) {
  const childenv = Object.assign({}, process.env);
  childenv.BOTTLE_USER_ID = msg.author.id;
  childenv.BOTTLE_USER_TAG = `${msg.author.username}#${msg.author.discriminator}`;
  return childenv;
}

function runCommand(cmd, msg, settings) {
  const promise = new Promise((resolve, reject) => {  
    // spawn the command
    const cmdargs = cmd.args;
    const proc = child_process.execFile(
      getCommandPath(cmd),
      cmdargs,
      {
        windowsHide: true,
        stdio: 'pipe',
        env: createCommandEnv(process.env, msg)
      },
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

async function initBot(client) {
  if (!fs.existsSync('users/')) {
    fs.mkdirSync('users');
  }
  if (!fs.existsSync('commands/')) {
    fs.mkdirSync('commands');
    fs.writeFileSync('commands/hello', 'console.log("Hello world!")\n');
  }
  // safer than running the python code
  // todo: keep in sync with bottle_lib.lib.init_bot
  var botUser = createBotProfile(client);
  if (fs.existsSync('users/bot.json')) {
    botUser = Object.assign(
      JSON.parse(fs.readFileSync('users/bot.json')), botUser);
  }
  fs.writeFileSync('users/bot.json', JSON.stringify(botUser, null, 4));
}

function createBotProfile(client) {
  const u = client.user;
  const botUser = {
    me: true,
    id: u.id,
    name: u.username,
    tag: `${u.username}#${u.discriminator}`
  };
  return botUser;
}

client.login(settings.token);

