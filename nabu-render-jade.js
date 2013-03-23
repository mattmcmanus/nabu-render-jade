/*
 * nabu-templates
 * https://github.com/mattmcmanus/nabu-cli
 *
 * Copyright (c) 2013 Matt McManus
 * Licensed under the MIT license.
 */
'use strict';

module.exports = render;

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    async = require('async'),
    jade = require('jade'),
    _ = require('underscore');

var templateExtension = '.jade';

/**
 * Render all the things!
 * 
 * @param  {Object}   nabu     The full nabu object
 * @param  {Function} callback 
 */
function render(nabu, callback) {
  async.parallel([
    async.apply(renderTemplates, nabu),
    async.apply(renderContent, nabu),
  ],
  function(err, results){
    callback(err, results);
  });
}

/**
 * Render all Jade templates that are not layouts
 * @param  {Object}   nabu     The full nabu object
 * @param  {Function} callback [description]
 */
function renderTemplates(nabu, callback) {
  var templateFiles = nabu.files.find(nabu._files, function(file){
    return (path.extname(file) === templateExtension && file.indexOf('/_') ===  -1); 
  });
  
  var layouts = loadLayouts(templateFiles);

  var eachLayout = function(layout, next) {
    nabu.log.info('Rendering ' + layout.src);
    var html = layout.render({site: nabu.site});
    var target = nabu.files.targetPath(nabu, path.basename(layout.src, templateExtension));
    fs.writeFile(target, html, next);
  };

  async.each(layouts, eachLayout, function(err){
      callback(err);
    }
  );
}

/**
 * Render generic templates (such as the blog index) and each individual file
 * 
 * @param  {[type]}   nabu     [description]
 * @param  {Function} callback [description]
 */
function renderContent(nabu, callback) {
  var files = [];

  // Pull the layout files out of _file list
  var layoutsPaths = nabu.files.findInFolder(nabu._files, '\/_layouts\/');

  nabu.site.layouts = loadLayouts(layoutsPaths);

  // Loop through everything to find arrays with items that have .layout
  for (var collection in nabu.site) {
    if (Array.isArray(nabu.site[collection])) {
      files.push(_.filter(nabu.site[collection], hasLayout));
    }
  }

  // The above loop returns clusters of files for each 
  // collection. Flatten it to one array
  files = _.flatten(files); 

  // Go through each file and render it
  var eachFile = function(file, next) {
    renderFile(nabu, file, next);
  };

  async.each(files, eachFile, function(err){
      callback(err);
    }
  );
}

function renderFile(nabu, file, callback) {
  nabu.log.info('Rendering '+file.sourcePath);
  var options = {};

  // Make sure the layout file specified in the front matter exists
  if (_.isUndefined(nabu.site.layouts[file.layout])) {
    throw new Error('There is no layout file by the name of ' + file.layout + ' specified in ' + file.sourcePath);
  }

  options.page = file;
  options.site = nabu.site;

  if (file.title) { options.title = file.title; }
  if (file.content) { options.content = file.content; }

  // Make sure all the folders are made
  mkdirp.sync(path.dirname(file.targetPath));

  var html = nabu.site.layouts[file.layout].render(options);
  
  fs.writeFile(file.targetPath, html, function(err){
    callback(err);
  });
}

/**
 * A quick check to see if a file has declared a layout
 * @param  {Object}  item
 * @return {Boolean}
 */
function hasLayout(item){
  return !_.isUndefined(item.layout);
}

/**
 * Iterate over each layout path and create compiled jade template functions
 */
function loadLayouts(layoutsPaths) {
  var layouts = {};

  layoutsPaths.forEach(function(layoutSrc) {
    var template = fs.readFileSync(layoutSrc); // Load the file
    var render = jade.compile(template, { filename: layoutSrc}); // Compile it to a function

    layouts[path.basename(layoutSrc.split('.')[1])] = {render: render, src: layoutSrc};
  });

  return layouts;
}