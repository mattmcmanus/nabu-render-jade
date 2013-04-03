'use strict';

var nabu_render = require('../nabu-render-jade.js'),
    rimraf = require('rimraf'),
    fs = require('fs');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var nabu = require('../../nabu');
var generator = nabu({render: 'jade'});

process.chdir('./test/fixtures');

generator._files = ['./index.html.jade','./atom.xml.jade', './_layouts/default.jade', './_layouts/post.jade'];
generator.site.posts = [{ sourcePath: './_posts/2012-12-1-sample1.md',
    permalink: '2012-12-1-sample1/index.html',
    targetPath: './_site/2012-12-1-sample1/index.html',
    layout: 'post',
    title: 'Sample Post',
    comments: true,
    categories: 'Life',
    content_raw: '\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',    content: 'Markdowned!',
    slug: 'sample-post' },
    { sourcePath: './_posts/2012-12-1-sample2.md',
    permalink: '2012-12-1-sample2/index.html',
    targetPath: './_site/2012-12-1-sample2/index.html',
    layout: 'post',
    title: 'Sample Post',
    comments: true,
    categories: 'Life',
    content_raw: '\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',    content: 'Markdowned!',
    slug: 'sample-post2' }];
  
generator.site.destination = './_site';

exports['nabu'] = {
  setUp: function(done) {
    done();
  },
  'parse': function(test) {
    test.expect(7); // There should be two blog posts to test
    
    nabu_render(generator, function(err, results){
      test.ok(generator.site, 'There shold be a nabu posts object');
      test.equal(err, null, 'There should be no error');
      test.ok(fs.existsSync(generator.site.destination), '_site dir exists');
      test.ok(fs.existsSync(generator.site.destination + '/2012-12-1-sample1/index.html'), 'Sample post 1 was generated');
      test.ok(fs.existsSync(generator.site.destination + '/2012-12-1-sample2/index.html'), 'Sample post 2 was generated');
      test.ok(fs.existsSync(generator.site.destination + '/index.html'), 'The homepage was generated');
      test.ok(fs.existsSync(generator.site.destination + '/atom.xml'), 'The atom feed was generated');
      test.done();
    });
    
  },
  tearDown: function(done) {
    rimraf(generator.site.destination, done);
  }
};
