"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const angular = require('angular');
require("spinal-core-connectorjs_type");
angular
    .module('app.services')
    .factory('FileVersionManagerService', [
    'goldenLayoutService', '$q',
    function (goldenLayoutService, $q) {
        const init = () => {
            const defer = $q.defer();
            return defer.promise;
        };
        const openVersion = (file) => {
            if (factory.panel === null) {
                const cfg = {
                    isClosable: true,
                    title: 'File Explorer',
                    type: 'component',
                    componentName: 'SpinalHome',
                    componentState: {
                        template: 'FileExplorer.html',
                        module: 'app.FileExplorer',
                        controller: 'FileExplorerCtrl',
                    },
                };
                goldenLayoutService.createChild(cfg);
            }
        };
        const factory = {
            init,
            openVersion,
            panel: null,
        };
        return factory;
    },
]);
//# sourceMappingURL=fileVersionService.js.map