// Needed for Firefox so result of content script is structured-clonable.
module.exports = ({ name }) => (name.split('/').pop() == 'content.js' ? { footer: ', undefined' } : undefined)
