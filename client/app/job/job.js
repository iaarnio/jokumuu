(function () {
  'use strict';

  angular.module('jokumuuApp')
    .config(function ($routeProvider) {
      $routeProvider
        .when('/job', {
          templateUrl: 'app/job/job.html',
          controller: 'JobCtrl',
          controllerAs: 'vm'
        });
    });
})();