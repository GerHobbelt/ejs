/*!
 * EJS - Preprocessors test
 * Copyright(c) 2016 Nabil Redmann <repo@nabil-redmann.de>
 * MIT Licensed
 */

/**
 * Just have a test string appended
 */

exports.appender = function(templateText) {
  return (templateText + '\n\nAppended a string.');
};
