import FacebookLogInController from "./controllers/facebookLogInController";
import FacebookService from "./services/facebookService";

// Register controller and service to the module 
let moduleName = "facebookConnect";
var module = angular.module(moduleName, []);
module.controller("facebookLogInController", FacebookLogInController);
module.service("facebookService", FacebookService)

// Binding the module to element after the module is ready
let rootElement = angular.element(".facebook-connect-app").get(0);
angular.bootstrap(rootElement, [moduleName]);