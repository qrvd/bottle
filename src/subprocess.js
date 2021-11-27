const child_process = require('child_process');
const process = require('process');
const { getUserMutex } = require('./usermutex.js');
const shellescape = require('shell-escape');

const fs = require('fs');
const path = require('path');
const { PATH } = require('./settings.js');
const isAtHome = fs.existsSync(PATH);
const fg = require('fast-glob');

const COMMANDS_PATH = path.resolve(path.join('.', 'commands'));

module.exports = {
  execCommand: execCommand
};

async function execCommand(cmd, cmdUser) {
  const userMutex = await getUserMutex(cmdUser);
  return await userMutex.runExclusive(async () => {
    return await execCommandHelper(cmd, cmdUser)
  });
}

function asyncStat(...args) {
  return new Promise((resolve, reject) => {
    fs.stat(...args, (err, stat) => {
      if (err) reject(err); else resolve(stat);
    })
  });
}

async function execCommandHelper(cmd, cmdUser) {
  const commandPath = await getCommandPath(cmd);
  const stat = await asyncStat(commandPath);
  return new Promise((resolve, reject) => {
    const onExit = (error, stdout, stderr) => {
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
    };
    const env = createCommandEnv(process.env, cmdUser);
    const options = {
      env: createCommandEnv(process.env, cmdUser),
      stdio: 'pipe',
      windowsHide: true,
      cwd: path.dirname(commandPath)
    };
    if (stat.isDirectory()) {
      fs.readFile(path.join(commandPath, 'command.json'), (err, bytes) => {
        if (err) {
          reject(err);
        } else {
          const json = JSON.parse(bytes);
          const cmdline = json?.run;
          if (!json) {
            reject(new Error("command.json contains invalid JSON!"));
          } else if (!cmdline) {
            reject(new Error("command.json does not have a \"run\" field!"));
          } else {
            const fullCmd = cmdline + ' ' + shellescape(cmd.args);
            const newOpts = {};
            Object.assign(newOpts, options);
            newOpts.cwd = commandPath;
            child_process.exec(fullCmd, newOpts, onExit);
          }
        }
      });
    } else {
      child_process.execFile(commandPath, cmd.args, options, onExit);
    }
  });
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

async function getCommandPath(cmd) {
  // note: commands could also contain any symbols, if replaced by UUIDs or something
  validateBasename(cmd.name);
  const p = path.toNamespacedPath(
    path.resolve(fg.escapePath(path.join(COMMANDS_PATH, cmd.name)))
  );
  if (path.dirname(p) !== COMMANDS_PATH) {
    throw "Error: Malicious command name";
  }
  return await resolveCommandPath(p);
}

async function resolveCommandPath(p) {
  // Resolve any ambiguity
  const entries = await fg([p, p + '.*'], {onlyFiles: false});
  if (entries.length === 0) {
    throw "No such command";
  } else if (entries.length > 1) {
    if (entries.includes(p)) {
      return p;
    }
    throw "Error! There are multiple commands with this name!"
  }
  return entries[0];
}

// todo: "parse, don't validate"
function validateBasename(name) {
  // todo: OS-specific
  if (['.', '..'].includes(name) || name.includes(path.delimiter)) {
    throw "Invalid command name! (Dangerous)";
  }
  if (['bottle', 'bottle_lib'].includes(name)) {
    throw "Invalid command name! (Reserved)";
  }
  // note: command names can include spaces (shop buy, shop sell, ...)
}

