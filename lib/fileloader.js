'use strict';

var fs = require('fs')
  , path = require('path')
  , utils = require('./utils')
  , _BOM = /^\uFEFF/;


/*
 * since exists is depricated, and the full path is required anyways:
 */
function realpathSyncNoErr(fpath) {
  try {
    return fs.realpathSync(fpath);
  }
  catch (e) {
    return null;
  }
}

/*
 * a good, edge case supporting, isString fn
 */
function isString(obj) {
  return (typeof obj === 'string' || obj instanceof String);
}
/*
 * added
 */
function isObject(obj) {
  return obj instanceof Object && !(obj instanceof Array)
}



var FileSelector = function constructor(filePath, optionalDefaultExt) {
  this.filePath = filePath;
  this.optionalDefaultExt = optionalDefaultExt || '.ejs';
  this.files = [];
}

utils.shallowCopy(FileSelector.prototype, {
  // convinience ...  var tpl = new FileSelector('myPath/file.ejs').singeFileSupport()
  toString: function () {
    return new ContentOutputter( new ContentLoader(this).loadAll() ).toString();
  },

  // generic fn applier (you may use glob from npm to select files),  fn(filePath<string>, currentfiles<array<string>>):newFilesToAdd<array<string>>
  fileSupportFn: function(fn) {
    if (newFiles = fn.call(null, this.filePath, this.files)) {
      this.files = this.files.concat(newFiles);
    }

    return this;
  },

  singleFileSupport: function() {
    try { // invalid file path are also ok: since it may be a path construct to be parsed by starSupport or alike
      var fpath;
      if ( ( (fpath = realpathSyncNoErr(this.filePath)) || (fpath = realpathSyncNoErr(this.filePath + this.optionalDefaultExt)) ) && fs.lstatSync(fpath).isFile()) {
        this.files.push(fpath);
      }
    }
    catch (e)
    {;}

    return this;
  },
  
  starSupport: function (optionalAllowedExts) {
    try {
      if (/[\\\/]*/.test( this.filePath.slice(-2) ))
      {
        var self = this
          , dir = this.filePath.substr(0, this.filePath.length-2)
          , rdir = fs.realpathSync(dir)
          , newFiles = fs.readdirSync( rdir ).map(function(value) { // fetch all files and prepend real path (and node caches them)
            return fs.realpathSync(rdir + '/' + value);
          })
          , optionalAllowedExts = isString(optionalAllowedExts) ? [optionalAllowedExts] : (Array.isArray(optionalAllowedExts) ? optionalAllowedExts : [this.optionalDefaultExt]);

        newFiles = newFiles.filter(function(value, i, arr) {
          try {
            return ~optionalAllowedExts.indexOf(path.extname(value)) && fs.lstatSync(value).isFile();
          }
          catch (e) { return false; }
        });

        this.files = this.files.concat(newFiles);
      }
    }
    catch (e)
    {;}

    return this;
  }
});


var ContentLoader = function constructor(fileSelector) {
  this.fileSelector = fileSelector;
  this.contents = []; // [ [filePath<string>, tpl:<string>], .. ]
  this.fileLoader = fs.readFileSync;
}

utils.shallowCopy(ContentLoader.prototype, {

  loadAllFn: function(fn) {
    var self = this;
    // load file contents, fn(path)
    self.fileSelector.files.forEach(function (p) {
     self.contents.push( [p, fn.call(null, p)] );
    });

    return this;
  },

  loadAll: function() {
    var self = this;
    // load file contents
    self.fileSelector.files.forEach(function (p) {
     self.contents.push( [p, self.fileLoader( p )] );
    });

    return this;
  }

});



var ContentOutputter = function constructor(contentLoader) {
  this.contentLoader = contentLoader;
  this.contents = utils.shallowCopy([], contentLoader.contents);
}

utils.shallowCopy(ContentOutputter.prototype, {

  toString: function () {
    var appended = '';

    this.contents.forEach(function (p) {
       appended += p[1].toString().replace(_BOM, '');   // in case it is still all buffers, and has multiple BOMs
    });

    return appended;
  },

  // generic fn applier
  applyFn: function(fn) {
    var self = this;
    // fn(path<buffer>, content<string>):newContent<string|buffer>
    this.contents.forEach(function (p, i) {
       p[1] = fn.call(null, p);
    });

    return this;
  },

  filterWords: function(optionalRegexp, optionalReplacement) {
    var self = this
      , optionalRegexp = optionalRegexp || /shit/
      , optionalReplacement = optionalReplacement || 'Moo';

    this.contents.forEach(function (p, i) {
       p[1] = p[1].toString().replace(optionalRegexp, optionalReplacement);
    });

    return this;
  },

  jsHandler: function(optionalDelimiter) {
    var self = this
      , d = optionalDelimiter || '%';

    this.contents.forEach(function (p, i) {
       if (path.extname(p[0]) == '.js') {
        p[1] = '<' + d + ' ' + p[1] + ' ' + d + '>';
      }
    });

    return this;
  }
});



exports.FileSelector = FileSelector;
exports.ContentLoader = ContentLoader;
exports.ContentOutputter = ContentOutputter;


var FileLoader = function constructor(opts) {
  /*
  Example:
  opts =
  {
    FileSelector: ['singleFileSupport', 'starSupport', {'starSupport': optionalAllowedExts=['.ejs']}, {'fileSupportFn': function(filePath, inFiles){ return []; }}],
    ContentLoader: ['loadAll'],
    ContentOutputter: ['filterWords']
  }
  */

  var opts = utils.shallowCopy({
    FileSelector: [],
    ContentLoader: [],
    ContentOutputter: []
  }, opts);


  /*
    x = new FileSelector('/*').singleFileSupport().starSupport();
    y = new ContentLoader(x).loadAll();
    z = new ContentOutputter(y).filterWords();
    - now you could trigger any preprocessor on each loaded tpl:string using: `z.applyFn( preprocessor(<string>):<string> );`
    tpl = z.toString();
    - now you could trigger any preprocessor on the complete tpl:string : finishdTpl = preprocessor(tpl)
  */

  var order = ['FileSelector', 'ContentLoader', 'ContentOutputter'];


  return function(filePath) {
    var last  = filePath; // ref to last (last param)

    order.forEach(function(optName) {
      var optSet = opts[optName];

      var ref = new exports[optName](last);

      if (optName == 'ContentLoader' && !optSet.length) {
        ref.loadAll();
      }

      optSet.forEach(function(opt, i) {
        if (isString(opt)) {
          ref[opt].call(ref);
        }
        else if (isObject(opt)) {
          Object.keys(opt).forEach(function(key) {
            var value = opt[key];
            ref[key].apply(ref, value);
          });
        }
      });

      last = ref;
    });

    return last.toString();

  };

}

exports.FileLoader = FileLoader;
