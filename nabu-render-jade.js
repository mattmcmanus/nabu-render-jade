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
 * @param  {Function} callback [description]
 */
function render(nabu, callback) {
  async.parallel([
    function(done){
      renderTemplates(nabu, done);
    },
    function(done){
      renderContent(nabu, done);
    }
  ],
  function(err, results){
    // console.log("RENDER COMPLETE");
    callback(err, nabu);
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
  
  for (var layout in layouts) {
    var html = layouts[layout].render({site: nabu.site});
    var target = nabu.files.targetPath(nabu, path.basename(layouts[layout].src, templateExtension));
    fs.writeFile(target, html, callback);
  }
}

/**
 * Render generic templates (such as the blog index) and each individual file
 * 
 * @param  {[type]}   nabu     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function renderContent(nabu, callback) {
  // 1. Load all layouts and compile them to functions
  // 2. Load all generic templates, compile to functions and render
  // 3. Render each individual piece of content
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

  files = _.flatten(files);

  // Go through each file and render it
  async.each(files, 
    function(file) {
      renderFile(nabu, file, callback);
    }, 
    function(err){
      callback(err);
    }
  );
}

function renderFile(nabu, file, callback) {
  var options = {};

  // Make sure the layout file specified in the front matter exists
  if (_.isUndefined(nabu.site.layouts[file.layout])) {
    throw new Error('There is no layout file by the name of ' + file.layout + ' specified in ' + file.sourcePath);
  }

  options.page = file;
  options.site = nabu.site;

  if (file.title) {
    options.title = file.title;
  }

  if (file.content) {
    options.content = file.content;
  }

  mkdirp.sync(path.dirname(file.targetPath));

  var html = nabu.site.layouts[file.layout].render(options);
  
  fs.writeFile(file.targetPath, html, function(err){
    // console.log("WRITTEN");
    callback(err);
  });
}

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