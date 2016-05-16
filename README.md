# EJS

Embedded JavaScript templates


## Installation

```bash
Latest:
$ npm install github:BananaAcid/ejs-with-exts

or last published:
$ npm install ejs-with-exts
```

## Features

  * Control flow with `<% %>`
  * Escaped output with `<%= %>` (escape function configurable)
  * Unescaped raw output with `<%- %>`
  * Newline-trim mode ('newline slurping') with `-%>` ending tag
  * Whitespace-trim mode (slurp all whitespace) for control flow with `<%_ _%>`
  * Custom delimiters (e.g., use '<? ?>' instead of '<% %>')
  * Includes
  * Client-side support
  * Static caching of intermediate JavaScript
  * Static caching of templates
  * Complies with the [Express](http://expressjs.com) view system
  * --
  * readded old style filters ( `<%- your_var | first %>` )
  * preprocessor option to pass a function to proccess the content before EJS
  * Issues fixed from the @mde tracker
  * using option 'with', it applies the correct context
  * es6 yield support (setting option `{es6: true}`)
  * echo as function to output strings from code
  * cli tool (`$ ejs`), as stdin compiler and as file/folder compiler
  * fileLoader is a global ejs option that can be replaced to imply security settings
  * codeTransformer is another global option - to unleash JS compilers onto the loaded JS (sourcemaps are not supported yet)
  * fileLoader management classes + simple wrapper
    * able to parse different path constructs
    * handle content loading
    * modify (like word filters) content)
  * renderFile is able to return the content directly if callback is set to `null` (returns `{err,content}`)
  * ExpressJS multi-views support

## Example

```html
<% if (user) { %>
  <h2><%= user.name %></h2>
<% } %>
```

## Usage

```javascript
var template = ejs.compile(str, options);
template(data);
// => Rendered HTML string

var templateStr = ejs.render(str, data, options);
// => Rendered HTML string

 // right most param is expected to be the callback
var cbResult = ejs.renderFile(filename, data, options, cb=function(err, str) {
    // err => Error
    // str => Rendered HTML string
});
// => result from the cb

var info = ejs.renderFile(filename, data, options, cb=null);
// => {err: Error|null, content: "Rendered HTML string"|null}
```

It is also possible to use `ejs.render(dataAndOptions);` where you pass
everything in a single object. In that case, you'll end up with local variables
for all the passed options. However, be aware that your code could break if we 
add an option with the same name as one of your data object's properties.
Therefore, we do not recommend using this shortcut.

## Options

  - `cache`           Compiled functions are cached, requires `filename`
  - `filename`        The name of the file being rendered. Not required if you 
    are using `renderFile()`. Used by `cache` to key caches, and for includes.
  - `context`         Function execution context
  - `compileDebug`    When `false` no debug instrumentation is compiled
  - `client`          When `true`, compiles a function that can be rendered in the browser without needing to load the EJS Runtime
  - `delimiter`       Character to use with angle brackets for open/close
  - `debug`           Output generated function body
  - `strict`          When set to `true`, generated function is in strict mode
  - `_with`           Whether or not to use `with() {}` constructs. If `false` then the locals will be stored in the `locals` object. Set to `false` in strict mode.
  - `localsName`      Name to use for the object storing local variables when not using `with` Defaults to `locals`
  - `rmWhitespace`    Remove all safe-to-remove whitespace, including leading
    and trailing whitespace. It also enables a safer version of `-%>` line
    slurping for all scriptlet tags (it does not strip new lines of tags in
    the middle of a line).
  - `preprocessor`    Add a function that accepts and returns a string to proccess the content before EJS
  - `escape`          The escaping function used with `<%=` construct. It is used in rendering and is `.toString()`ed in the generation of client functions. (By default escapes XML).

## Global Options
set on the `ejs` object itself

  - `delimiter`       Character to use with angle brackets for open/close
  - `fileLoader`      Use to To imply security restrictions, takes a filepath, returns a template string (see fileLoader management classes)
  - `codeTransformer` Use to pass prepared template JS to a compiler function (takes and returns a JS-code string) that unserstands EJS-debug JS (TypeScript, babeljs, ..)

## JSDoc usage

This project uses [JSDoc](http://usejsdoc.org/). For the full public API 
documentation, clone the repository and run `npm run doc`. This will run JSDoc 
with the proper options and output the documentation to `out/`. If you want 
the both the public & private API docs, run `npm run devdoc` instead.

## Tags

  - `<%`              'Scriptlet' tag, for control-flow, no output
  - `<%=`             Outputs the value into the template (escaped)
  - `<%-`             Outputs the unescaped value into the template
  - `<%#`             Comment tag, no execution, no output
  - `<%%`             Outputs a literal '<%'
  - `%%>`             Outputs a literal '%>'
  - `%>`              Plain ending tag
  - `-%>`             Trim-mode ('newline slurp') tag, trims following newline

## Includes

3 Methods
  - `<%- include('path'); %>`   independly called, outputted, `echo()` outputting to the include's buffer which is returned by include() (so `<%-` or a variable is needed to use the returned buffer)
  - `<% include path %>`        sharing context (if added to this), single line command (old backwards compat)
  - `#include 'some.js';`       sharing context (if added to this), is part of the code / can be used with other statements (and other hash-include-directives)

Includes either have to be an absolute path, or, if not, are assumed as
relative to the template with the `include` call. For example if you are 
including `./views/user/show.ejs` from `./views/users.ejs` you would 
use `<%- include('user/show') %>`.

You must specify the `filename` option for the template with the `include` 
call unless you are using `renderFile()`.

You'll likely want to use the raw output tag (`<%-`) with your include to avoid
double-escaping the HTML output.

```html
<ul>
  <% users.forEach(function(user){ %>
    <%- include('user/show', {user: user}) %>
  <% }); %>
</ul>
```

Includes are inserted at runtime, so you can use variables for the path in the
`include` call (for example `<%- include(somePath) %>`). Variables in your
top-level data object are available to all your includes, but local variables
need to be passed down.

_NOTE:_ Standalone EJS-Include-preprocessor directives (`<% include user/show %>`) are
still supported.

_NOTE:_ In subsequently loaded templates, you can add functions and vars to be
available in the parents and other subequent templates by using 
`this`, e.g. `this.myGlobalVar = 123;`

### about the include directive

since there are sandbox/security restrictions, you may use the hash-include-directive
to include files in the the same scope, within the same output buffer:
```cpp
<%
  #include 'some.js';
  #include 'some2.ejs';
%>
<%
  this.fnFromSome();
%>
```

## Custom delimiters

Custom delimiters can be applied on a per-template basis, or globally:

```javascript
var ejs = require('ejs'),
    users = ['geddy', 'neil', 'alex'];

// Just one template
ejs.render('<?= users.join(" | "); ?>', {users: users}, {delimiter: '?'});
// => 'geddy | neil | alex'

// Or globally
ejs.delimiter = '$';
ejs.render('<$= users.join(" | "); $>', {users: users});
// => 'geddy | neil | alex'
```

## Caching

EJS ships with a basic in-process cache for caching the intermediate JavaScript
functions used to render templates. It's easy to plug in LRU caching using
Node's `lru-cache` library:

```javascript
var ejs = require('ejs')
  , LRU = require('lru-cache');
ejs.cache = LRU(100); // LRU cache with 100-item limit
```

If you want to clear the EJS cache, call `ejs.clearCache`. If you're using the
LRU cache and need a different limit, simple reset `ejs.cache` to a new instance
of the LRU.

## Layouts

EJS does not specifically support blocks, but layouts can be implemented by
including headers and footers, like so:


```html
<%- include('header') -%>
<h1>
  Title
</h1>
<p>
  My page
</p>
<%- include('footer') -%>
```

_NOTE:_ you may use the preprocessor option to load Jade, Markdown and others.
They may generate EJS parsable code, since preprocessors are parsed first.

## FileLoader

EJS by default, just loads a file an parses it. To imply security restrictions,
modify the output, or just rewrite the path and load the content, the loader can
be replaced globally:

```javascript
var ejs = require('ejs');

ejs.fileLoader = function(filePath) {
  return 'new content + from file: ' + fs.readFileSync(filePath);
};
```
_NOTE:_ the preprocessor option is able to modify the content on a per-template
basis, based on the loaded and prepared contents before EJS parses it.

## fileLoader management classes

A more complex way is using the FileLoader managememnt classes allows you to 
modify the data each object holds

```javascript
var ejs = require('ejs');

ejs.fileLoader = function(filePath) {
  var flm = ejs.fileLoaderManagement
    , x = new flm.FileSelector(filePath).singleFileSupport().starSupport()
    , y = new flm.ContentLoader(x).loadAll()
    , z = new flm.ContentOutputter(y).filterWords()
    //- now you could trigger any preprocessor on each loaded tpl:string using: `z.applyFn( the_preprocessor(<string>):<string> );`
    , tpl = z.toString();
    //- now you could trigger any preprocessor on the complete tpl:string : finishdTpl = the_preprocessor(tpl)

  return tpl;
};
```

You may also use the defaults for content loading and parsing, if the file selection is what you need

```javascript
var ejs = require('ejs');

ejs.fileLoader = function(filePath) {
  var flm = ejs.fileLoaderManagement
    , tpl = new flm.FileSelector(filePath, '.ejs').singleFileSupport(); // or any other FileSelector function

  return tpl;
};
```

But: there is also a file management classes wrapper that returns a fileLoader handler:

```javascript
var ejs = require('ejs');

ejs.fileLoader = new ejs.fileLoaderManagement.FileLoader({
  FileSelector: ['singleFileSupport', 'starSupport', {'fileSupportFn': function(filePath, inFiles){ return /*outFIles*/[]; }}],
  ContentLoader: ['loadAll'],
  ContentOutputter: ['filterWords']
});

```

### FileSelector FNs
  `new FileSelector(filePath, optionalDefaultExt)`
  parses a path
  - `fileSupportFn(fn)`     user supplied fn, `fn(filePath<string>, currentfiles<array<string>>):newFilesToAdd<array<string>>`
  - `singleFileSupport()`   add parsing of single files, and without and without ext
  - `starSupport(optionalAllowedExts)`  support path with `*` (e.g. `'./tpls/*'`) instead of a file to load all from a folder, array of exts to load (defaults to optionalDefaultExt or '.ejs')
  - `toString()`            loads all selected files and returns the concatinated template by ContentOutputter (see file management wrapper)

### ContentLoader FNs
  `new ContentLoader(fileSelector)`
  loads files
  - `loadAllFn(fn)`         user supplied fn gets called on each path from FileSelector, `fn(path<string>)`
  - `loadAll()`             loads the contents of all files

### ContentOutputter FNs
  `new ContentOutputter(contentLoader)`
  modifies the loaded contents on a per file basis
  - `applyFn(fn)`           applies a user function to all loaded template chunks, `fn(path<buffer>, content<string>):newContent<string|buffer>`
  - `filterWords(optionalRegexp, optionalReplacement)`  applies a replace
  - `jsHandler(optionalDelimiter)`    if a .js file is called, it wrapps it into EJS default `<% .. %>` delimiters (if you do not use the default ones, you will need to supply them here too)
  - `toString()`            concatinates all contents and returns the completed template (see file management wrapper)

## Output

echo() can be used to output strings from code. (`<% echo('Hello world'); %>`)

## Client-side support

Go to the [Latest Release](./releases/latest), download
`./ejs.js` or `./ejs.min.js`. Alternately, you can compile it yourself by cloning 
the repository and running `jake build` (or `$(npm bin)/jake build` if jake is 
not installed globally).

Include one of these files on your page, and `ejs` should be available globally.

### Example

```html
<div id="output"></div>
<script src="ejs.min.js"></script>
<script>
  var people = ['geddy', 'neil', 'alex'],
      html = ejs.render('<%= people.join(", "); %>', {people: people});
  // With jQuery:
  $('#output').html(html);
  // Vanilla JS:
  document.getElementById('output').innerHTML = html;
</script>
```

### Caveats

Most of EJS will work as expected; however, there are a few things to note:

1. Obviously, since you do not have access to the filesystem, `ejs.renderFile()` won't work.
2. For the same reason, `include`s do not work unless you use an `IncludeCallback`. Here is an example:
  ```javascript
  var str = "Hello <%= include('file', {person: 'John'}); %>",
      fn = ejs.compile(str, {client: true});
  
  fn(data, null, function(path, d){ // IncludeCallback
    // path -> 'file'
    // d -> {person: 'John'}
    // Put your code here 
    // Return the contents of file as a string
  }); // returns rendered string
  ```


## CLI tool

Just open the help to get going.

```bash
$ ejs --help

 EJS - Embedded JavaScript templates CLI
 
  Usage:  [options] [dir|file ...]                                                 
                                                                                   
  Options:                                                                         
                                                                                   
    -h, --help               output usage information                              
    -V, --version            output the version number                             
    -O, --obj <str|path>     JavaScript options object or JSON file containing it  
    -l, --locals <str|path>  JavaScript locals object or JSON file containing it   
    -o, --out <dir>          output the compiled html to <dir>, otherwise to screen
    -p, --path <path>        filename used to resolve includes                     
    -d, --delimiter <char>   delimiter to use for denoting JS code                 
    -c, --client             compile function for client-side                      
    -D, --no-debug           compile without debugging (smaller functions)         
    -w, --watch              watch files for changes and automatically re-render   
    -E, --extension <ext>    specify the output file extension                     
                                                                                   
  Examples:                                                                        
                                                                                   
    # renders all EJS files in the `templates` directory                           
    $ ejs templates                                                                
                                                                                   
    # create {foo,bar}.html                                                        
    $ ejs {foo,bar}.ejs                                                            
                                                                                   
    # read my.ejs and output to my.html through stdio                              
    $ ejs my.ejs > my.html                                                         
                                                                                   
    # reads EJS string from stdin and output to stdout                             
    $ echo '<%= "hello ejs" %>' | ejs                                              
                                                                                   
    # reads EJS string from stdin and output to my.html through stdio              
    $ echo '<%= "hello ejs" %>' | ejs > my.html                                    
                                                                                   
    # reads EJS string from stdin and output to my.html through stdio and gzip it  
    $ echo '<%= "hello ejs" %>' | ejs | gzip -f > my.html.gz                       
                                                                                   
    # foo, bar dirs rendering to /tmp                                              
    $ ejs foo bar --out /tmp
```

## Related projects

There are a number of implementations of EJS:

 * TJ's implementation, the v1 of this library: https://github.com/tj/ejs
 * Jupiter Consulting's EJS: http://www.embeddedjs.com/
 * EJS Embedded JavaScript Framework on Google Code: https://code.google.com/p/embeddedjavascript/
 * Sam Stephenson's Ruby implementation: https://rubygems.org/gems/ejs
 * Erubis, an ERB implementation which also runs JavaScript: http://www.kuwata-lab.com/erubis/users-guide.04.html#lang-javascript

## License

Licensed under the Apache License, Version 2.0
(<http://www.apache.org/licenses/LICENSE-2.0>)

- - -
EJS Embedded JavaScript templates copyright 2112
mde@fleegix.org.
