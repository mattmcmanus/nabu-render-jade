/*
 * nabu-templates
 * https://github.com/mattmcmanus/nabu-cli
 *
 * Copyright (c) 2013 Matt McManus
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    async = require('async');

exports.processFiles = function(nabu, callback) {
  var templates = nabu.utils.findFiles(nabu.files, function(file){ 
    return (path.extname(file) === '.'+nabu.site.template_engine); 
  });

  // Update file list
  nabu.files = nabu.utils.removePaths(nabu.files, templates);

  // Add assets to site
  nabu.site.templates = templates;
  
  callback(null, nabu);
};

var nabu = {};
/**
 * Render all the files!
 *
 * @param  {Object}   post     The object for an individual post
 * @param  {Function} callback the callback
 */
nabu.renderFile = function(file, options, callback) {
  options.page = file;
  options.site = nabu.site;
  options.filename = file.layout;

  mkdirp.sync(path.dirname(file.targetPath));

  file.layoutPath = (nabu.site.layouts.indexOf(file.layout)) ? nabu.site.layouts[file.layout] : file.sourcePath;

  nabu.render(file.layoutPath, options, function(err, html) {
    if (err) { console.log(err); throw err; }
    fs.writeFile(file.targetPath, html, callback);
  });
};

nabu.renderContent = function(file, callback) {
  var options = {
    title: file.title,
    content: file.content
  };

  nabu.renderFile(file, options, callback);
};

nabu.renderTemplate = function(file, callback) {
  // Nothing to do here. Yet!
  nabu.renderFile(file, {}, callback);
};

/**
 * Render all the things!
 */
nabu.renderFileType = function(type, callback) {
  nabu.plugins[type].renderFiles(nabu, callback);
};

nabu.renderSite = function(callback) {
  async.map(nabu.hooks.renderFile, nabu.renderFileType, function(err, results){
    if (err) { console.log(err); }
    callback(err);
  });
};