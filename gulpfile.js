/// <reference path="typings/node/node.d.ts"/>
var gulp = require('gulp');
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var path = require('path');
var $ = require('gulp-load-plugins')({lazy: true});
var config = require('./gulp.config.js')();
var port = process.env.PORT || config.defaultPort;

gulp.task('default', ['help']);
gulp.task('help', $.taskListing);
gulp.task('serve-dev', ['inject'], serveDev);
gulp.task('inject', inject);
gulp.task('watch', watch);
gulp.task('mongo-start', mongoStart);
gulp.task('mongo-stop', mongoStop);

/* Tasks */

function serveDev() {
  var nodeOptions = {
    script: config.nodeServer,
    delayTime: 1,
    watch: [config.server]
  };

  return $.nodemon(nodeOptions)
    .on('restart', function() {
      log('nodemon restarting');
      reloadBrowserSyncAfterDelay(config.startBrowsersyncDelay);
    })
    .on('start', function() {
      log('nodemon starting');
      startBrowserSync();
    });
}

function watch() {
  log('Starting to watch .scss changes');
  gulp.watch(config.styles.files, ['sass'])
    //.pipe($.plumber())
    .on('change', function(evt) {
      log('[watcher] File ' + evt.path.replace(/.*(?=sass)/,'') + ' was ' + evt.type + ', compiling...');
    });
}

function inject() {
  log('Wire up the bower js & css and app js into the index.html');
  var wiredep = require('wiredep').stream;
  var wiredepOptions = config.getWiredepOptions();
  var jsAndCss = [].concat(config.js, config.css);
//  var sources = gulp.src(jsAndCss, {read: false});
  var sources = gulp.src(jsAndCss, {read: false});
  var injectOptions = config.getInjectOptions();
  log(injectOptions.ignorePath);
  
//  var sources = gulp.src([config.js, config.css], {base: './src/', read: false});

  return gulp
    .src(config.index)
    .pipe(wiredep(wiredepOptions))
    .pipe($.inject(sources, injectOptions))
    .pipe(gulp.dest(config.client));
}

function mongoStart() {
  log('Starting MongoDB');
  runCommand('mongod --config ' + path.join(__dirname, 'db.config'));
}

function mongoStop() {
  log('Stopping MongoDB');
  runCommand('mongo admin --eval "db.shutdownServer();"');
}


/* Utility functions */

function runCommand(command) {
  log('Running command: ' + command);
  var exec = require('child_process').exec;

  exec(command, function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    if (err) {
      console.log(err);
    }
  });
}

function startBrowserSync() {
  if (args.nosync || browserSync.active) {
    return;
  }

  log('Starting browser sync on port ' + port);

  var options =  {
    proxy: 'localhost:' + port,
    port: 3000,
    files: [
      config.client + '**/*.*',
      '!' + config.client + '**/*.scss',
      config.temp + '**/*.css'
      ],
    ghostMode: {
      clicks: true,
      location: false,
      forms: true,
      scroll: true
    },
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'debug',
    logPrefix: 'gulp',
    notify: true,
    reloadDelay: 1000
  };

  browserSync(options);
}

function reloadBrowserSyncAfterDelay(delay) {
  setTimeout(function() {
    browserSync.notify('reloading now...');
    browserSync.reload({stream: false});
  }, delay);
}

// A display error function, to format and make custom errors more uniform
// Could be combined with gulp-util or npm colors for nicer output
function displayError(error) {

  // Initial building up of the error
  var errorString = '[' + error.plugin + ']';
  errorString += ' ' + error.message.replace("\n",''); // Removes new line at the end

  // If the error contains the filename or line number add it to the string
  if (error.fileName)
    errorString += ' in ' + error.fileName;

  if (error.lineNumber)
    errorString += ' on line ' + error.lineNumber;

  // This will output an error like the following:
  // [gulp-sass] error message in file_name on line 1
  console.error(errorString);
};


function log(msg) {
	$.util.log($.util.colors.blue(msg));
}
