"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const angular = require('angular');
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const fileVersionManagerCtrl_1 = require("../controller/fileVersionManagerCtrl");
const moment = require('moment');
const spinal_model_file_version_model_1 = require("spinal-model-file_version_model");
const dowloadPathCheck_1 = require("../utils/dowloadPathCheck");
angular
    .module('app.services')
    .controller(fileVersionManagerCtrl_1.default.ctrlName, fileVersionManagerCtrl_1.default.ctrl);
angular
    .module('app.services')
    .factory('fileVersionManagerService', [
    'goldenLayoutService', '$q', '$templateCache', '$http',
    function (goldenLayoutService, $q, $templateCache, $http) {
        let modelProcessBind = null;
        let lastFvC = null;
        const loadTemplateFunc = (uri, name) => {
            return $http.get(uri).then(response => {
                $templateCache.put(name, response.data);
            }, () => {
                console.error(`Cannot load the file ${uri}`);
            });
        };
        const toload = [
            {
                uri: fileVersionManagerCtrl_1.default.templateUri,
                name: fileVersionManagerCtrl_1.default.templateName,
            },
        ];
        let initPromise = null;
        const init = () => {
            if (initPromise !== null)
                return initPromise.promise;
            initPromise = $q.defer();
            $q.all(toload.map((elem) => {
                return loadTemplateFunc(elem.uri, elem.name);
            })).then(() => {
                initPromise.resolve();
            }).catch((e) => {
                console.error(e);
                const prom = initPromise;
                initPromise = null;
                prom.reject();
            });
            return initPromise.promise;
        };
        const openVersionPanel = (file) => {
            return factory.init().then(() => {
                const oldFile = factory.lastFile;
                factory.lastFile = file;
                if (factory.controllerOnChange === null) {
                    const cfg = {
                        isClosable: true,
                        title: 'File Version Manager',
                        type: 'component',
                        componentName: 'SpinalHome',
                        width: 20,
                        componentState: {
                            template: fileVersionManagerCtrl_1.default.templateName,
                            module: 'app.controllers',
                            controller: fileVersionManagerCtrl_1.default.ctrlName,
                        },
                    };
                    goldenLayoutService.createChild(cfg);
                    function onItemDestroy(item) {
                        if (item && item.config && item.config.componentState &&
                            item.config.componentState.controller &&
                            item.config.componentState.controller === fileVersionManagerCtrl_1.default.ctrlName) {
                            controllerDestroy();
                            goldenLayoutService.myLayout.off('itemDestroyed', onItemDestroy);
                        }
                    }
                    goldenLayoutService.myLayout.on('itemDestroyed', onItemDestroy);
                }
                else if (oldFile !== factory.lastFile) {
                    return spinal_model_file_version_model_1.FileVersionContainerModel.getVersionModelFromFile(factory.lastFile)
                        .then((fvc) => {
                        if (modelProcessBind !== null) {
                            lastFvC.unbind(modelProcessBind);
                        }
                        lastFvC = fvc;
                        modelProcessBind = fvc.bind(onChangeModel);
                    });
                }
            });
        };
        const versionRdy = (versionModel) => {
            const q = $q.defer();
            const fct = (version) => {
                if (version &&
                    version.ptr &&
                    version.ptr.data) {
                    if (version.ptr.data.value) {
                        return q.resolve();
                    }
                    else if (version.ptr.data.model &&
                        version.ptr.data.model._server_id &&
                        !spinal_core_connectorjs_type_1.FileSystem._tmp_objects[version.ptr.data.model._server_id]) {
                        return q.resolve();
                    }
                }
                setTimeout(fct.bind(null, version), 200);
            };
            fct(versionModel);
            return q.promise;
        };
        const onChangeModel = () => {
            if (factory.controllerOnChange === null)
                return;
            const versionLst = [];
            const promise = [];
            for (let idx = 0; idx < lastFvC.versionLst.length; idx++) {
                promise.push(versionRdy(lastFvC.versionLst[idx]));
            }
            $q.all(promise).then(() => {
                for (let idx = 0; idx < lastFvC.versionLst.length; idx++) {
                    const version = lastFvC.versionLst[idx];
                    const obj = {
                        date: moment(new Date(version.date.get())),
                        versionNbr: version.versionId.get(),
                    };
                    try {
                        obj.serverId = version.ptr.data.value;
                    }
                    catch (e) {
                    }
                    versionLst.push(obj);
                }
                factory.controllerOnChange({
                    file: factory.lastFile,
                    versions: versionLst,
                    current: lastFvC.currentID.get(),
                });
            });
        };
        const controllerOpenRegister = (funcOnChange, funcOnDestroy) => {
            factory.controllerOnChange = funcOnChange;
            factory.controllerDestroyFunc = funcOnDestroy;
            return spinal_model_file_version_model_1.FileVersionContainerModel.getVersionModelFromFile(factory.lastFile)
                .then((fvc) => {
                lastFvC = fvc;
                modelProcessBind = fvc.bind(onChangeModel);
            });
        };
        const controllerDestroy = () => {
            return spinal_model_file_version_model_1.FileVersionContainerModel.getVersionModelFromFile(factory.lastFile)
                .then((fvc) => {
                if (modelProcessBind !== null) {
                    lastFvC.unbind(modelProcessBind);
                }
                factory.controllerDestroyFunc();
                factory.controllerOnChange = null;
            });
        };
        const addNewVersion = (file) => {
            return spinal_model_file_version_model_1.FileVersionContainerModel.getVersionModelFromFile(factory.lastFile).then((fvc) => {
                const path = new spinal_core_connectorjs_type_1.Path(file);
                const newVersion = fvc.addVersion(path, file.name);
                return {
                    path: dowloadPathCheck_1.default(path, $q),
                    filename: factory.lastFile.name.get(),
                    version: newVersion.versionId.get(),
                };
            });
        };
        const setVersion = (versionNbr) => {
            return spinal_model_file_version_model_1.FileVersionContainerModel.getVersionModelFromFile(factory.lastFile).then((fvc) => {
                fvc.setVersionById(versionNbr);
            });
        };
        const removeVersionById = (versionNbr) => {
            return spinal_model_file_version_model_1.FileVersionContainerModel.getVersionModelFromFile(factory.lastFile).then((fvc) => {
                return fvc.removeVersionById(versionNbr);
            });
        };
        const getDescription = (versionNbr) => {
            return spinal_model_file_version_model_1.FileVersionContainerModel.getVersionModelFromFile(factory.lastFile).then((fvc) => {
                const description = fvc.getDescriptionById(versionNbr);
                return typeof description === 'undefined' ? '' : description.get();
            });
        };
        const setDescription = (versionNbr, newDescription) => {
            return spinal_model_file_version_model_1.FileVersionContainerModel.getVersionModelFromFile(factory.lastFile).then((fvc) => {
                const description = fvc.getDescriptionById(versionNbr);
                if (description)
                    description.set(newDescription);
            });
        };
        init();
        const factory = {
            init,
            openVersionPanel,
            controllerOpenRegister,
            controllerDestroy,
            getDescription,
            setDescription,
            setVersion,
            addNewVersion,
            removeVersionById,
            controllerOnChange: null,
            lastFile: null,
        };
        return factory;
    },
]);
//# sourceMappingURL=FileVersionManagerService.js.map