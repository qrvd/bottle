
function escape(str) {
  return str.replace(/(?=\W)/g, '\\')
}

function wholeWord(str, options = '') {
  return new RegExp('\\b' + Escape(str) + '\\b', options)
}

module.exports = {
  escape: escape,
  wholeWord: wholeWord,
}
