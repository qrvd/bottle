const fs = require('fs');

async function init(clientUser) {
  if (!fs.existsSync('users/')) {
    fs.mkdirSync('users');
  }
  if (!fs.existsSync('commands/')) {
    fs.mkdirSync('commands');
    fs.writeFileSync('commands/hello', 'console.log("Hello world!")\n');
  }
  // safer than running the python code
  // todo: keep in sync with bottle_lib.lib.init_bot
  var botUser = buildBotUser(clientUser);
  if (fs.existsSync('users/bot.json')) {
    botUser = Object.assign(
      JSON.parse(fs.readFileSync('users/bot.json')), botUser);
  }
  fs.writeFileSync('users/bot.json', JSON.stringify(botUser, null, 4));
}

function buildBotUser(clientUser) {
  const u = clientUser;
  const botUser = {
    me: true,
    id: u.id,
    name: u.username,
    tag: `${u.username}#${u.discriminator}`
  };
  return botUser;
}

function buildCommandUser(discordUser) {
  const u = discordUser;
  const cmdUser = {
    id: u.id,
    name: u.username,
    tag: `${u.username}#${u.discriminator}`
  };
  return cmdUser;
}

module.exports = {
  init: init,
  buildCommandUser: buildCommandUser
};

