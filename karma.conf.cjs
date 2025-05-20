module.exports = function (config) {
    config.set({
      basePath: '',
      frameworks: ['jasmine', '@angular-devkit/build-angular'],
      plugins: [
        require('karma-jasmine'),
        require('karma-chrome-launcher'),
        require('karma-coverage'),
        require('@angular-devkit/build-angular/plugins/karma'),
      ],
      client: {
        clearContext: false, // Leave Jasmine Spec Runner output visible in browser
      },
      jasmineHtmlReporter: {
        suppressAll: true, // Removes the duplicated traces
      },
      reporters: ['progress', 'coverage'],
      coverageReporter: {
        dir: require('path').join(__dirname, './coverage'),
        subdir: '.',
        reporters: [
          { type: 'lcov', subdir: '.' },
          { type: 'text-summary' }
        ],
      },
      
      port: 9876,
      colors: true,
      logLevel: config.LOG_INFO,
      autoWatch: true,
      browsers: ['Chrome'],
      singleRun: false,
      restartOnFileChange: true,
    });
  };
  