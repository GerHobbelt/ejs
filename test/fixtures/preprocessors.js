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

/**
 * Just a Jade example
 * And YES: npm install jade
 *
 * options:  http://jade-lang.com/api/
 */

exports.jade = function(templateText) {
  var jade = require('Jade');

  return jade.compile(templateText)();
};