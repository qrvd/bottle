const { Mutex } = require('async-mutex');

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

module.exports = {
  getUserMutex: getUserMutex
};
