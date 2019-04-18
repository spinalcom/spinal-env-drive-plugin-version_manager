"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const spinalEnvDriveCore = require('spinal-env-drive-core');
require('spinal-core-connectorjs');
const angular = require('angular');
angular
    .module('app.controllers')
    .run([
    'fileVersionManagerService',
    function (fileVersionManagerService) {
        class SpinalDriveAppFileExplorerOpenVersionManager extends spinalEnvDriveCore.SpinalDrive_App {
            constructor() {
                super('OpenVersionManager', 'Open the version manager', 31, 'history', 'Open the version manager');
                this.order_priority = 0;
            }
            action(obj) {
                const fileModel = (spinal_core_connectorjs_type_1.FileSystem._objects[obj.file._server_id]);
                fileVersionManagerService.openVersionPanel(fileModel);
            }
            is_shown(file) {
                const modelType = file.file.model_type;
                if (modelType === 'Path') {
                    return true;
                }
                return false;
            }
        }
        window.spinalDrive_Env.add_applications('FileExplorer', new SpinalDriveAppFileExplorerOpenVersionManager());
    },
]);
//# sourceMappingURL=OpenVersionManager.js.map