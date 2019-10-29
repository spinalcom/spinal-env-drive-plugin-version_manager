"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
const mergeArray_1 = require("../utils/mergeArray");
const knownExt_1 = require("../utils/knownExt");
const angular = require('angular');
const path = require('path');
const controller = {
    ctrlName: 'fileVersionManagerCtrl',
    templateName: 'file_version_manager.html',
    templateUri: '../templates/spinal-env-drive-plugin-version_manager/file_version_manager.html',
    ctrl: [
        '$scope',
        'fileVersionManagerService',
        '$mdDialog',
        function ($scope, fileVersionManagerService, $mdDialog) {
            $scope.fileVersion = [];
            $scope.currentVersion = null;
            $scope.openAllVersion = false;
            $scope.filename = '';
            $scope.descriptonVersion = 1;
            $scope.canUpload = true;
            $scope.descriptonText = '';
            $scope.onClickVersion = (ev, item) => {
                if (item === $scope.currentVersion)
                    return true;
                const confirm = $mdDialog.confirm()
                    .title('Confirm the current version modification.')
                    .textContent(`The current version will be set from version ${$scope.currentVersion.versionNbr} to version ${item.versionNbr}.`)
                    .ariaLabel('Confirm the current version modification.')
                    .clickOutsideToClose(true).targetEvent(ev).ok('ok')
                    .cancel('cancel');
                $mdDialog.show(confirm).then(function () {
                    fileVersionManagerService.setVersion(item.versionNbr);
                }, function () { });
            };
            $scope.canPreview = () => {
                const ext = path.extname($scope.filename).toLocaleUpperCase();
                for (let idx = 0; idx < knownExt_1.default.length; idx++) {
                    const extname = knownExt_1.default[idx];
                    if (ext === extname) {
                        return true;
                    }
                }
                return false;
            };
            $scope.onClickPreview = (ev, item) => {
                if (!item.serverId) {
                    console.error('item.serverId not set');
                    return;
                }
                const srcIframe = `${location.origin}/sceen/_?u=${item.serverId}`;
                $mdDialog.show({
                    clickOutsideToClose: true,
                    escapeToClose: true,
                    template: `<md-dialog layout-padding aria-label="preview dialog"
        style="min-width: 60vw; min-height: 70vh;">
<h3>Preview</h3>
<md-dialog-content style="height: calc(70vh - 16px);overflow: hidden;">
   <iframe style="
   width: 100%;
   width: -moz-available;
   width: -webkit-fill-available;
   width: fill-available;
   height: calc(70vh - 62px);
   " ng-src="${srcIframe}" />
</md-dialog-content>
</md-dialog>`,
                });
            };
            $scope.onClickDescription = (ev, item) => {
                fileVersionManagerService.getDescription(item.versionNbr).then((text) => {
                    $scope.descriptonVersion = item.versionNbr;
                    $scope.descriptonText = text;
                    $scope.descriptonDialog = $mdDialog.show({
                        contentElement: document.getElementById('version-description-dialog'),
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                    }).then((result) => {
                    }).catch((err) => {
                    });
                }, (err) => {
                    console.error(err);
                });
            };
            $scope.onDescriptionSave = () => {
                fileVersionManagerService.setDescription($scope.descriptonVersion, $scope.descriptonText)
                    .then(() => {
                    $mdDialog.hide();
                });
            };
            $scope.onDescriptionClose = () => {
                $mdDialog.hide();
            };
            $scope.onClickDeleteVersion = (ev, item) => {
                if (item === $scope.currentVersion)
                    return true;
                const confirm = $mdDialog.confirm()
                    .title(`Confirm the deletion of the version ${item.versionNbr}.`)
                    .textContent(`The Version ${item.versionNbr} of the ${$scope.filename} file will be deleted. This action is not reversible.`)
                    .ariaLabel(`Confirm the deletion of the version ${item.versionNbr}.`)
                    .clickOutsideToClose(true).targetEvent(ev).ok('ok')
                    .cancel('cancel');
                $mdDialog.show(confirm).then(function () {
                    return fileVersionManagerService.removeVersionById(item.versionNbr);
                }, function () { });
            };
            $scope.onClickUpload = () => {
                angular.element('.version-manager-container input#input-upload').click();
            };
            $scope.addNewVerion = (file) => {
                if (file) {
                    fileVersionManagerService.addNewVersion(file).then((res) => {
                        // // to do later
                        // if (res.versionFilename !== $scope.filename) {
                        //   // filename changed
                        //   var confirm = $mdDialog.confirm()
                        //     .title('Update Name ?')
                        //     .textContent('The new file version have a new name do you wish to update it ?')
                        //     .ariaLabel('Update Name ?')
                        //     .ok('Yes')
                        //     .cancel('No');
                        //   $mdDialog.show(confirm).then(function () {
                        //     // $scope.status = 'You decided to get rid of your debt.';
                        //     $scope.filename = res.versionFilename;
                        //   }, function () {
                        //     $scope.status = 'You decided to keep your debt.';
                        //   });
                        // }
                        res.path.then(() => {
                            if (res.filename === $scope.filename) {
                                for (let idx = 0; idx < $scope.fileVersion.length; idx++) {
                                    const element = $scope.fileVersion[idx];
                                    if (res.version === element.versionNbr) {
                                        if (element.upload_pecent) {
                                            delete element.upload_pecent;
                                        }
                                        break;
                                    }
                                }
                            }
                        }, () => {
                            console.error('download error');
                        }, (progress) => {
                            if (res.filename === $scope.filename) {
                                for (let idx = 0; idx < $scope.fileVersion.length; idx++) {
                                    const element = $scope.fileVersion[idx];
                                    if (res.version === element.versionNbr) {
                                        element.upload_pecent = progress;
                                        break;
                                    }
                                }
                            }
                        });
                    });
                }
            };
            $scope.$watch('$viewContentLoaded', function () {
                const uplaodInput = angular.element('.version-manager-container input#input-upload');
                const handleInput = () => {
                    $scope.addNewVerion(uplaodInput[0].files[0]);
                };
                uplaodInput.on('change', handleInput);
                fileVersionManagerService.controllerOpenRegister((data) => {
                    if (data.file._info.model_type.get() !== 'Path')
                        $scope.canUpload = false;
                    else
                        $scope.canUpload = true;
                    $scope.filename = data.file.name.get();
                    mergeArray_1.default($scope.fileVersion, data.versions, (origin, to) => {
                        return origin.versionNbr === to.versionNbr && origin.date === to.date;
                    }, (origin, to) => {
                        return origin.versionNbr - to.versionNbr;
                    });
                    for (let idx = 0; idx < $scope.fileVersion.length; idx++) {
                        const element = $scope.fileVersion[idx];
                        if (data.current === element.versionNbr) {
                            $scope.currentVersion = element;
                            break;
                        }
                    }
                    // $scope.$apply();
                }, () => {
                    uplaodInput.off('change', handleInput);
                });
            });
        }
    ],
};
exports.default = controller;
//# sourceMappingURL=fileVersionManagerCtrl.js.map