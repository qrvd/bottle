const FILENAME = 'bottle.json';
const PATH = `./${FILENAME}`;
const fs = require('fs');
const prompt = require('prompt');

const state = {settings: null};

function createNewSettings() {
  return new Promise((resolve, reject) => {
    prompt.start();
    const newSettings = {
      prefix: '.',
      token: null
    };
    prompt.get(['token', 'prefix'], function (err, result) {
      if (err) return reject(err);
      newSettings.token = result.token.trim();
      const p = result.prefix.trimStart();
      if (p && p.length > 0) {
        newSettings.prefix = p;
      }
      console.error(`Setting prefix to "${newSettings.prefix}".`);
      console.error(`Creating a new ${FILENAME} file...`);
      fs.writeFileSync(PATH, JSON.stringify(newSettings, null, 4));
      console.error(`Done!`);
      prompt.stop();
      resolve();
    });
  });
}

async function ensureSettingsExist() {
  if (!fs.existsSync(PATH)) {
    await createNewSettings();
  }
}

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
  PATH: PATH,
  ensureSettingsExist: ensureSettingsExist
};


