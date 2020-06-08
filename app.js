(
  function (){
    'use strict';

    var myapp = angular.module('osa_app', ['ngRoute']);

    // AngularJS service to persist the state between tab changes or scope changes
    myapp.factory('CommonService', function() {
        var commonService = {};
        commonService.queryResponse = "";
        commonService.queryInput = "";
        commonService.queryLogs = "";
        commonService.checked = false;
        commonService.xdata = '{}';
        commonService.ydata = '{}';
        commonService.status = 'stopped';

        commonService.setQueryResponse = function (input, response, logs) {
            commonService.queryResponse = response;
            commonService.queryInput = input;
            commonService.queryLogs = logs;
        };

        commonService.setData = function(xdata, ydata) {
            commonService.xdata = xdata;
            commonService.ydata = ydata;
        }

        commonService.disableButtons = function (isDisabled) {
          commonService.checked = isDisabled;
        }

        commonService.setStatus = function(status) {
          commonService.status = status;
        }
        // CanvasJS code to display the graphs
        commonService.drawGraph = function() {
            var xdata = commonService.xdata;
            var ydata = commonService.ydata;
            var limit = xdata.length;
            var data = [];
            var dataSeries = { type: "line", lineColor:"gold" };
            var dataPoints = [];
            for (var i = 0; i < limit; i += 1) {
            	dataPoints.push({
            		x: xdata[i],
            		y: ydata[i]
            	});
            }

            dataSeries.dataPoints = dataPoints;
            data.push(dataSeries);

            var options = {
            	zoomEnabled: true,
              backgroundColor: "#000000",
            	title: {
            		text: ""
            	},
            	axisY: {
                title: "Units: DBM",
                titleFontColor: "grey",
                titleFontSize: 20,
            		includeZero: false,
            		lineThickness: 1,
                labelFontColor: "gold",
                gridThickness: 0.2,
            	},
              axisX:{
                title: "Units: M",
                titleFontSize: 20,
                titleFontColor: "grey",
                labelFontColor: "gold",
              },
            	data: data  // random data
            };

            var chart = new CanvasJS.Chart("chartContainer", options);
            chart.render();
        }

        return commonService;
    });

    // Code to route to different tabs in the Application without reloading the page
    myapp.config(function($routeProvider){
      $routeProvider
            .when('/', {
              templateUrl: 'Client/home.html',
              controller  : 'homeController'
            })

            .when('/query', {
              templateUrl: 'Client/query.html',
              controller  : 'queryController'
            })

            .when('/logs', {
              templateUrl: 'Client/logs.html',
              controller  : 'queryController'
            })

            .otherwise({
                redirectTo: "Client/home.html"
            });
    });

    // Controller definitions and injecting dependencies
    myapp.controller('homeController', homeController);
    myapp.controller('queryController', queryController);
    homeController.$inject = ['$scope', '$http', '$location', '$interval', 'CommonService'];
    queryController.$inject = ['$scope', '$http', '$location', 'CommonService'];

    // Controller to query the commands
    function queryController($scope, $http, $location, CommonService){
      $scope.queryInput = CommonService.queryInput;
      $scope.queryResponse = CommonService.queryResponse;
      $scope.queryLogs = CommonService.queryLogs;


      $scope.getQueryResponse = function () {
        $scope.queryLogs += "Requesting the response for the query: "+ $scope.queryInput + "\n";
        $http.get('http://localhost:5000/query?queryInput='.concat($scope.queryInput)).then(function(response) {
            if($scope.queryInput == "TRACE"){
              $scope.queryResponse = JSON.stringify(response.data);
            } else {
              $scope.queryResponse = response.data;
            }

            $scope.queryLogs += "Receieved the response for the query: "+ $scope.queryInput + "\n";
            CommonService.setQueryResponse($scope.queryInput, $scope.queryResponse, $scope.queryLogs);
            console.log($scope.queryResponse);
        });
      }

      // This code is to make the tab in the navigation bar active
      $scope.isActive = function (viewLocation) {
          console.log("came to isActive");
          return viewLocation === $location.path();
      };
    }

    function homeController($scope, $http, $location, $interval, CommonService){
      $scope.queryLogs = CommonService.queryLogs;
      $scope.checked = CommonService.checked;
      $scope.xdata = CommonService.xdata;
      $scope.ydata = CommonService.ydata;
      $scope.status = CommonService.status;
      var interval;
      if (CommonService.xdata != '{}'){
        CommonService.drawGraph();
      }

      $scope.getSingle = function() {
        $scope.checked = true;
        CommonService.disableButtons(true);
        $scope.queryLogs += "Requesting the response for the query: SINGLE\n";
        $http.get('http://localhost:5000/TRACE').then(function(response) {
            $scope.queryLogs += "Receieved the response for the query: SINGLE\n";
            $scope.queryResponse = response.data;
            console.log(response.data);

            $scope.xdata = response.data['xdata'];
            $scope.ydata = response.data['ydata'];

            console.log($scope.xdata);

            CommonService.setData($scope.xdata, $scope.ydata);
            CommonService.setQueryResponse($scope.queryInput, $scope.queryResponse, $scope.queryLogs);

            CommonService.drawGraph();
            $scope.checked = false;
            CommonService.disableButtons(false);
        });
      }

      $scope.startAcquisition = function() {
          console.log("came to acquisition")
          $scope.status = "started";
          $scope.isStarted = true;
          CommonService.setStatus($scope.status);

          var count = 3;
          console.log("starting the acquisition...")
          $scope.queryLogs += "Starting the Continuous Acquisition\n";
          interval = $interval(function() {
            $http.get('http://localhost:5000/TRACE').then(function(response) {
              console.log("Sending a TRACE request for Continuous Acquisition");
              $scope.queryResponse = response.data;

              $scope.xdata = response.data['xdata'];
              $scope.ydata = response.data['ydata'];

              CommonService.setData($scope.xdata, $scope.ydata);
              CommonService.setQueryResponse($scope.queryInput, $scope.queryResponse, $scope.queryLogs);

              CommonService.drawGraph();
          })
          }, 1000);
      }

      $scope.stopAcquisition = function() {
          console.log("came to stop")
          $scope.queryLogs += "Stopping the Continuous Acquisition\n";
          $interval.cancel(interval);
          $scope.status = "stopped"
          $scope.isStarted = false;
          CommonService.setQueryResponse($scope.queryInput, $scope.queryResponse, $scope.queryLogs);
          CommonService.setStatus($scope.status);
      }
    }
  }
)();
