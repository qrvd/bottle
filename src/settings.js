const FILENAME = 'bottle.json';
const PATH = `./${FILENAME}`;
const fs = require('fs');

const state = {settings: null};

function get() {
  if (!state.settings) {
    const settings = JSON.parse(fs.readFileSync(PATH));
    if (!settings.prefix) throw "prefix is not defined in bottle.json";
    if (!settings.token) throw "token is not defined in bottle.json";
    state.settings = settings;
  }
  return state.settings;
}

module.exports = {
  get: get,
  FILENAME: FILENAME,
  PATH: PATH
};


