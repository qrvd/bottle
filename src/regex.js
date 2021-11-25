
function regexEscape(str) {
  return str.replace(/(?=\W)/g, '\\')
}

function wholeWord(str, options = '') {
  return new RegExp('\\b' + regexEscape(str) + '\\b', options)
}

module.exports = {
  escape: regexEscape,
  wholeWord: wholeWord,
}
