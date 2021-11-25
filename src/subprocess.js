const child_process = require('child_process');
const process = require('process');

module.exports = {
  execCommand: execCommand
};

function execCommand(cmd, cmdUser) {
  const promise = new Promise((resolve, reject) => {  
    // spawn the command
    const cmdargs = cmd.args;
    const proc = child_process.execFile(
      getCommandPath(cmd),
      cmdargs,
      { env: createCommandEnv(process.env, cmdUser),
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

function createCommandEnv(originalEnv, cmdUser) {
  const childenv = Object.assign({}, originalEnv);
  childenv.BOTTLE_USER_ID = cmdUser.id;
  childenv.BOTTLE_USER_TAG = cmdUser.tag; 
  if (isAtHome) {
    childenv.BOTTLE_HOME_PATH = '.';
  }
  return childenv;
}

function getCommandPath(cmd) {
  // todo: safer concat
  // note: commands could also contain any symbols, if replaced by UUIDs or something
  validateBasename(cmd.name);
  const path = `commands/${cmd.name}`;
  return path;
}

// todo: "parse, don't validate"
function validateBasename(name) {
  if (name.includes('/') || name.includes('.') || name.includes('\\')) {
    throw "Invalid command name! (Dangerous)";
  }
  // note: command names can include spaces (shop buy, shop sell, ...)
}

