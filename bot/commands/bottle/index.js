const lib = require('../bottle_lib');
const process = require('process');

// Setup context for command
const user = lib.getCurrentUser();

if (!process.env._BOTTLE_NO_AUTOSAVE) {
    // save changes automatically
    process.on('quit', () => {
      lib.saveUser(user);
    });
}

module.exports = {
  user: user
};

