'use strict';

var assign = require('object-assign');
var fs = require('fs');
var grunt = require('grunt');
var path = require('path');

var addons = {
  CSSTransitionGroup: {
    module: 'ReactCSSTransitionGroup',
    name: 'css-transition-group',
  },
  LinkedStateMixin: {
    module: 'LinkedStateMixin',
    name: 'linked-state-mixin',
  },
  Perf: {
    module: 'ReactDefaultPerf',
    name: 'perf',
  },
  PureRenderMixin: {
    module: 'ReactComponentWithPureRenderMixin',
    name: 'pure-render-mixin',
  },
  TestUtils: {
    module: 'ReactTestUtils',
    name: 'test-utils',
  },
  TransitionGroup: {
    module: 'ReactTransitionGroup',
    name: 'transition-group',
  },
  cloneWithProps: {
    module: 'cloneWithProps',
    name: 'clone-with-props',
  },
  createFragment: {
    module: 'ReactFragment',
    method: 'create',
    name: 'create-fragment',
  },
  shallowCompare: {
    module: 'shallowCompare',
    name: 'shallow-compare',
  },
  updates: {
    module: 'update',
    name: 'update',
  },
};

function generateSource(info) {
  var pieces = [
    "module.exports = require('react/lib/",
    info.module,
    "')",
  ];
  if (info.method) {
    pieces.push('.', info.method);
  }
  pieces.push(';');
  return pieces.join('');
}

function buildReleases() {
  var pkgTemplate = grunt.file.readJSON('./packages/react-addons/package.json');
  var license = grunt.file.read('./LICENSE');
  var patents = grunt.file.read('./PATENTS');

  Object.keys(addons).map(function(k) {
    var info = addons[k];
    var pkgName = 'react-addons-' + info.name;
    var destDir = 'build/packages/' + pkgName;

    var pkgData = assign({}, pkgTemplate);
    pkgData.name = pkgName;

    grunt.file.mkdir(destDir);
    fs.writeFileSync(path.join(destDir, 'index.js'), generateSource(info));
    fs.writeFileSync(path.join(destDir, 'package.json'), JSON.stringify(pkgData, null, 2));
    fs.writeFileSync(path.join(destDir, 'LICENSE'), license);
    fs.writeFileSync(path.join(destDir, 'PATENTS'), patents);
    fs.writeFileSync(
      path.join(destDir, 'README.md'),
      '# ' + pkgName + '\n\n' +
      'This package provides the React ' + k + ' add-on. See ' +
      'http://facebook.github.io/react/docs/addons.html for more information.\n'
    );
  });

}

function packReleases() {
  var done = this.async();
  var count = 0;

  var addonKeys = Object.keys(addons);

  addonKeys.forEach(function(k) {
    var info = addons[k];
    var pkgName = 'react-addons-' + info.name;
    var pkgDir = 'build/packages/' + pkgName;

    var spawnCmd = {
      cmd: 'npm',
      args: ['pack', pkgDir],
    };
    grunt.util.spawn(spawnCmd, function() {
      var buildSrc = pkgName + '-' + grunt.config.data.pkg.version + '.tgz';
      var buildDest = 'build/packages/' + pkgName + '.tgz';
      fs.rename(buildSrc, buildDest, maybeDone);
    });
  });

  function maybeDone() {
    if (++count === addonKeys.length) {
      done();
    }
  }
}

module.exports = {
  buildReleases: buildReleases,
  packReleases: packReleases,
};
