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

console.log(process.cwd());

var nabu = require('../../nabu/lib/nabu');

nabu._files = ['./test/fixtures/index.html.jade', './test/fixtures/_layouts/default.jade', './test/fixtures/_layouts/post.jade'];
nabu.site.posts = [{ sourcePath: './test/fixtures/_posts/2012-12-1-sample1.md',
    permalink: '2012-12-1-sample1/index.html',
    targetPath: './test/fixtures/_site/2012-12-1-sample1/index.html',
    layout: 'post',
    title: 'Sample Post',
    comments: true,
    categories: 'Life',
    content_raw: '\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',    content: 'Markdowned!',
    slug: 'sample-post' }];
  
nabu.site.renderer = 'jade';
nabu.site.destination = './test/fixtures/_site';

exports['nabu'] = {
  setUp: function(done) {
    done();
  },
  'parse': function(test) {
    test.expect(2); // There should be two blog posts to test
    
    nabu_render(nabu, function(err, nabu){
      test.ok(nabu.site, "There shold be a nabu posts object");
      test.ok(fs.existsSync(nabu.site.destination), "_site dir exists");
      // test.ok(fs.existsSync(nabu.site.destination + '/index.html'), "The homepage exists");
      test.done();
    });
    
  },
  tearDown: function(done) {
    rimraf(nabu.site.destination, done);
    // done();
  }
};
