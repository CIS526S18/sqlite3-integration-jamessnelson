const fs = require('fs');
const path = require('path');

/** @module View
  * A module for rendering template files with
  * embedded JavaScript signified with <%= %>.
  * Templates are chached for speed.
  * Template files should be placed in the 'templates'
  * directory, and are referred to by their relative
  * paths from that directory.
  */
module.exports = {
  cacheTemplates: cacheTemplates,
  render: render
}

var cache = {}

/** @function cacheTemplates
  * Loads the html templates into the cache
  * @throws {error} - a variety of filesystem errors are possible.
  * As this is a preload step, we'll want to stop execution.
  */
function cacheTemplates() {
  _loadDirectory('');
}

/** @function loadDirectory
  * Loads a directory of templates, and any subdirectories
  * recursively.
  * @param {path} directory - the directory path
  * @throws {error} - a variety of filesystem errors are possible.
  * As this is a preload step, we'll want to stop execution.
  */
function _loadDirectory(directory) {
  var items = fs.readdirSync(path.join('templates', directory));
  items.forEach(function(item){
    var stats = fs.statSync(path.join('templates', directory, item));
    // Store template files in the cache
    if(stats.isFile()) {
      var key = path.join(directory, item);
      var file = fs.readFileSync(path.join('templates', directory, item));
      // Before caching the template, we convert it to a string
      // and strip all newline characters (as they interfere with our
      // regular expressions)
      cache[key] = file.toString().split('\n').join(' ');
    }
    // Process subdirectories recursively
    if(stats.isDirectory()) {
      _loadDirectory(path.join(directory, item));
    }
  });
}

/** @method render
  * Renders the specified template, executing any
  * embedded JavaScript using the specified parameters
  * @param {String} template - the relative path to the template file
  * @param {Object} params - the parameters to use when rendering the template,
  * i.e. {name: 'bob'} will assign the value 'bob' to a var name within
  * the evaluation scope.
  */
function render(template, params) {
  if(!params) params = {}
  // Catch any evaluation errors that occur
  // while rendering the template
  try {
    var html = cache[template].replace(/<%=(.*?)%>/g, function(match, code) {
      // Create the variables for the passed-in params
      var scope = "";
      for(var key in params) {
        scope += "var " + key + "=" + JSON.stringify(params[key]) + ";";
      }
      // Evaulate the embedded code with the parameters
      return eval(scope + code);
    });
    // Return the rendered template
    return html;
  } catch (err) {
    // If we encountered an error, log it and return
    // an error marker string
    console.error(err);
    return '[An error occured]';
  }
}
