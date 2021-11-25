const child_process = require('child_process');
const process = require('process');
const { Mutex } = reqiure('async-mutex');

module.exports = {
  execCommand: execCommand
};

async function execCommand(cmd, cmdUser) {
  const userMutex = await getUserMutex(cmdUser);
  return await userMutex.runExclusive(() => await execCommandHelper(cmd, cmdUser));
}

function execCommandHelper(cmd, cmdUser) {
  const path = getCommandPath(cmd);
  const options = {
    env: createCommandEnv(process.env, cmdUser),
    stdio: 'pipe',
    windowsHide: true
  }; 
  return new Promise((resolve, reject) => {
    child_process.execFile(path, cmd.args, options, (error, stdout, stderr) => {
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
    });
  });
}

const globalMut = new Mutex();
const cmdMutexes = {};

async function getUserMutex(cmdUser) {
  var userMutex = cmdMutexes[cmdUser.id];
  if (!userMutex) {
    userMutex = await globalMut.runExclusive(() => {
      // check again (in case of race condition)
      if (!cmdMutexes[cmdUser.id]) {
        cmdMutexes[cmdUser.id] = new Mutex();
      }
      return cmdMutexes[cmdUser.id];
    });
  }
  return userMutex;
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

