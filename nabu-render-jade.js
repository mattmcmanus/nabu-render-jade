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
    jade = require('jade');

exports.templateExtension = '.jade';

/**
 * Iterate over each layout path and create compiled jade template functions
 * 
 * @param  {[String]} layoutsPaths An Array of paths
 * @return {Object}                 An object full of compiled jade functions
 */

exports.loadLayouts = function(layoutsPaths) {
  var layouts = {};

  layoutsPaths.forEach(function(layoutSrc) {
    var template = fs.readFileSync(layoutSrc); // Load the file
    var render = jade.compile(template, { filename: layoutSrc}); // Compile it to a function

    layouts[path.basename(layoutSrc.split('.')[1])] = {render: render, src: layoutSrc};
  });

  return layouts;
}