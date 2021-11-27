const process = require('process');
const path = require('path');
const fs = require('fs');
const { 
  COMMANDLINE_UID,
  DEFAULT_UID,
  SAFE_WRITE_PREFIX,
  DEFAULT_BOT_TAG,
  PATHS
} = require('./constants.json');

const state = {
  homePath: process.env['BOTTLE_HOME_PATH'],
  botUid: null
};

function getHomePath() {
  if (state.homePath) {
    return state.homePath;
  }
  var curdir = process.cwd();
  while (true) {
    if (fs.existsSync(path.join(curdir, 'bottle.json'))) {
      state.homePath = curdir;
      return curdir;
    }
    const idx = curdir.lastIndexOf(path.sep);
    if (idx === -1) {
      break;
    }
    curdir = curdir.slice(0, idx);
  }
  throw "Could not find bottle.json! To create it, start Bottle first.";
}

function getCurrentUserId() {
  return process.env['BOTTLE_USER_ID'] || COMMANDLINE_UID;
}

function getUserPath(uid) {
  return path.join(getHomePath(), PATHS.users, `${uid}.json`);
}

function userExists(uid) {
  return fs.existsSync(getUserPath(uid));
}

function newUser(uid) {
  const freshUser = {id: uid};
  if (userExists(DEFAULT_UID)) {
    const user = {};
    Object.assign(user, getUser(DEFAULT_UID));
    Object.assign(user, freshUser);
    return user;
  }
  return freshUser;
}

function dereferenceUid(uidRef) {
  if (state.botUid && uidRef == COMMANDLINE_UID) {
    return COMMANDLINE_UID;
  }
  return uidRef;
}

function getUser(uidRef) {
  const uid = dereferenceUid(uidRef);
  if (!userExists(uid)) {
    return newUser(uid);
  }
  const userPath = getUserPath(uid);
  // Make sure new defaults are always added
  var user = JSON.parse(fs.readFileSync(userPath));
  if (uid !== DEFAULT_UID && userExists(DEFAULT_UID)) {
    const newUser = {};
    Object.assign(newUser, getUser(DEFAULT_UID));
    Object.assign(newUser, user);
    user = newUser;
  }
  if (uidRef === COMMANDLINE_UID) {
    state.botUid = user.id;
  }
  return user;
}

function saveUser(user) {
  const destination = getUserPath(!!user['self'] ? COMMANDLINE_UID : user.id);
  safeWrite(destination, JSON.stringify(user, null, 4));
}

function safeWrite(destination, contents) {
  if (fs.existsSync(destination)) {
    const temp = SAFE_WRITE_PREFIX + destination;
    if (fs.existsSync(temp)) {
      // It'll be erased!
    }
    fs.writeFileSync(temp, contents);
    fs.rmSync(destination);
    fs.moveSync(temp, destination);
  } else {
    fs.writeFileSync(destination, contents);
  }
}

function getCurrentUser() {
  const uid = getCurrentUserId();
  const user = getUser(uid);
  if (user.tag) {
    return user;
  }
  if (uid === COMMANDLINE_UID) {
    console.error("Warning: Bot user has no tag! To set one, start the Bottle client first.");
    console.error(`Using default tag: ${DEFAULT_BOT_TAG}`);
  } else if (!process.env['BOTTLE_USER_TAG']) {
    console.error("Warning: Current user has no known tag! To set one, start the Bottle client and have them use a command.");
    console.error(`Using default tag: ${DEFAULT_BOT_TAG}`);
  }
  user.tag = DEFAULT_BOT_TAG;
  user.name = user.tag.slice(0, user.tag.indexOf('#'));
  saveUser(user);
  return getUser(uid);
}

module.exports = {
  saveUser: saveUser,
  getUser: getUser,
  getCurrentUser: getCurrentUser,
  getCurrentUserId: getCurrentUserId,
  getHomePath: getHomePath,
};

