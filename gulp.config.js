module.exports = function () {
  var client = './src/client/';
  var clientApp = client + 'app/';
  var bower = client + 'bower_components/';
  var server = './src/server/';

  var clientjs = [
      clientApp + '**/*.module.js',
      clientApp + '**/*.js',
      '!' + clientApp + '**/*.spec.js'
    ];
  var serverjs = [
      './src/server/**/*.js'
    ];
  var tooljs = [
      './*.js'
    ];

  var config = {

    //  File paths
    clientjs: clientjs,
    serverjs: serverjs,
    alljs: [].concat(clientjs, serverjs, tooljs),
    css: clientApp + '**/*.css',
    images: client + 'assets/images/**/*.*',
    index: client + 'index.html',
    client: client,
    server: server,

    // Browser sync
    startBrowsersyncDelay: 1000,

    // Bower and NPM locations
    bower: {
      json: require('./bower.json'),
      directory: bower,
      ignorePath: '../..'
    },

    // Node settings
    defaultPort: 9000,
    nodeServer: server + 'app.js'
  };

  config.getWiredepOptions = function () {
    var options = {
      bowerJson: config.bower.json,
      directory: config.bower.directory,
      ignorePath: config.bower.ignorePath
    };
    return options;
  };

  config.getInjectOptions = function () {
    var options = {
      ignorePath: '/src/client/'
    };
    return options;
  };

  return config;
};
