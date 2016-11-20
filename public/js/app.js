var app = angular.module('app', ['ui.router', 'ngStorage','mgcrea.ngStrap','angular-growl']);


angular.module('app')
    .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $httpProvider) {

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'login.html',
                controller: 'LoginCtrl'
            })
            .state('list', {
                url: '/list',
                templateUrl: 'list.html',
                controller: 'ListCtrl'
            })
            .state('edit', {
                url: '/edit/:id',
                templateUrl: 'edit.html',
                controller: 'EditCtrl'
            }).state('add', {
                url: '/edit',
                templateUrl: 'edit.html',
                controller: 'EditCtrl'
            });


        $urlRouterProvider.otherwise('login');

        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }

        $httpProvider.interceptors.push('JWTService');

    }])
    .factory('JWTService', ['$q', '$window', '$localStorage', function ($q, $window, $localStorage) {

        return {
            'request': function (config) {
                if ($localStorage.jwtToken) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = 'JWT ' + $localStorage.jwtToken;
                }
                return config;
            },
            'responseError': function (response) {
                if (response.status === 403) {
                    if ($localStorage.jwtToken) {
                        delete $localStorage.jwtToken;
                    }
                    $window.location.href = '#/login';
                }
                return $q.reject(response);
            }
        };
    }])
    .directive('appheader', ['$http', '$stateParams', '$state', '$localStorage', function ($http, $stateParams, $state, $localStorage) {
        return {
            restrict: 'E',
            template: ['<div class="container">'
                + '<a ng-if="loggedIn" href="#" ng-click="logout()">Logout</a>'
                + '</div>'].join(''),
            link: function (scope) {


                scope.logout = function () {
                    if ($localStorage.jwtToken) {
                        delete $localStorage.jwtToken;
                    }
                    $state.go('login');
                }

                scope.$watch(function () {
                    return $localStorage;
                }, function (newValue, oldValue) {
                    if (newValue.jwtToken) {
                        scope.loggedIn = true;
                    } else {
                        scope.loggedIn = false;
                    }

                }, true)


            }
        };
    }]);

angular.module('app').controller("LoginCtrl", ['$scope', '$http', '$state', '$localStorage', function ($scope, $http, $state, $localStorage) {
    $scope.login = function (user) {
        $http.post('/api/auth', user).then(function (result) {
            if (result.data.token) {
                $localStorage.jwtToken = result.data.token;
                $state.go('list');
            }
        }, function (error) {
            if (error.status == 401) {
                $scope.loginFailed = true;
            }
        });
    }
}]);


angular.module('app').controller("ListCtrl", ['$scope', '$http', '$state', function ($scope, $http, $state) {
    $http.get('/api/user').then(function (result) {
        $scope.users = result.data;
    });
}]);


angular.module('app').controller("EditCtrl", ['$scope', '$http', '$state', '$stateParams','$modal','growl', function ($scope, $http, $state, $stateParams, $modal, growl) {
    
    var confirmModal = $modal({scope: $scope, templateUrl: 'modal.confirm.html', show: false});
    
    if ($stateParams.id) {
        $http.get('/api/user/' + $stateParams.id).then(function (result) {
            $scope.user = result.data;
        });
    }

    $scope.save = function (user) {
        
        if (user._id) {
            $http.put('/api/user/' + user._id, user).then(function (result) {
                $state.go('list');
            });
        } else {
            $http.post('/api/user', user).then(function (result) {
                $state.go('list');
            });
        }
        growl.addSuccessMessage("Save successfully.");
    }

    $scope.delete = function (user) {
        $scope.confirmData = user;
        confirmModal.$promise.then(confirmModal.show);
    }


    $scope.confirmYes = function(data){   
        this.$hide();
        $http.delete('/api/user/' + data._id).then(function (result) {
            $state.go('list');
        });
        growl.addSuccessMessage("Delete successfully.");
    }

    $scope.confirmClose = function(data){
        this.$hide();
    }

}]);