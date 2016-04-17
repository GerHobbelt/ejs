/*!
 * EJS - Preprocessor test
 * Copyright(c) 2016 Nabil Redmann <repo@nabil-redmann.de>
 * MIT Licensed
 */

/**
 * Just have a test string appended
 */

exports.appender = function(templateText) {
  return (templateText + '\n\nAppended a string.');
};

/**
 * Just a Markdown example
 * And YES: npm install markdown-it
 */

exports.md = function(templateText) {
  var md = require('markdown-it')();

  return md.render(templateText);
};