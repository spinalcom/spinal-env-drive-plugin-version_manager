
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

const angular = require('angular');
import { Path, FileSystem } from 'spinal-core-connectorjs_type';
import fileVersionManagerCtrl from '../controller/fileVersionManagerCtrl';
const moment = require('moment');
import {
  FileVersionModel,
  FileVersionContainerModel,
} from 'spinal-model-file_version_model';
import dowloadPathCheck from '../utils/dowloadPathCheck';
type VersionReturn = {
  date: any,
  versionNbr: number,
  serverId?: number,
};

type FileVersionReturn = {
  file: spinal.File<any>;
  versions: VersionReturn[];
  current: number;
};
type FileCallbackOnChange = (obj: FileVersionReturn) => void;
type FileVersionService = {
  init: () => Promise<void>,
  openVersionPanel: (file: spinal.File<any>) => Promise<void>,
  lastFile: spinal.File<any>,
  controllerOpenRegister: (fct: FileCallbackOnChange, onDestroy: () => void) => void,
  controllerDestroy: () => void,
  controllerOnChange: FileCallbackOnChange,
  addNewVersion: (file: File) => void;
  [key: string]: any,
};

angular
  .module('app.services')
  .controller(fileVersionManagerCtrl.ctrlName, fileVersionManagerCtrl.ctrl);

angular
  .module('app.services')
  .factory('fileVersionManagerService', [
    'goldenLayoutService', '$q', '$templateCache', '$http',
    function (goldenLayoutService, $q, $templateCache, $http) {
      let modelProcessBind = null;
      let lastFvC = null;

      const loadTemplateFunc = (uri: string, name: string) => {
        return $http.get(uri).then(
          response => {
            $templateCache.put(name, response.data);
          },
          () => {
            console.error(`Cannot load the file ${uri}`);
          },
        );
      };
      const toload = [
        {
          uri: fileVersionManagerCtrl.templateUri,
          name: fileVersionManagerCtrl.templateName,
        },
      ];
      let initPromise = null;
      const init = (): Promise<void> => {
        if (initPromise !== null) return initPromise.promise;
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

      const openVersionPanel = (file: spinal.File<any>): Promise<void> => {
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
                template: fileVersionManagerCtrl.templateName,
                module: 'app.controllers',
                controller: fileVersionManagerCtrl.ctrlName,
              },
            };
            goldenLayoutService.createChild(cfg);
            function onItemDestroy(item) {
              if (item && item.config && item.config.componentState &&
                item.config.componentState.controller &&
                item.config.componentState.controller === fileVersionManagerCtrl.ctrlName) {
                controllerDestroy();
                goldenLayoutService.myLayout.off('itemDestroyed', onItemDestroy);
              }
            }
            goldenLayoutService.myLayout.on('itemDestroyed', onItemDestroy);
          } else if (oldFile !== factory.lastFile) {
            return FileVersionContainerModel.getVersionModelFromFile(factory.lastFile)
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
            } else if (version.ptr.data.model &&
              version.ptr.data.model._server_id &&
              !FileSystem._tmp_objects[version.ptr.data.model._server_id]) {
              return q.resolve();
            }
          }
          setTimeout(fct.bind(null, version), 200);
        };
        fct(versionModel);
        return q.promise;
      };

      const onChangeModel = () => {
        if (factory.controllerOnChange === null) return;
        const versionLst: VersionReturn[] = [];
        const promise = [];
        for (let idx = 0; idx < lastFvC.versionLst.length; idx++) {
          promise.push(versionRdy(lastFvC.versionLst[idx]));
        }
        $q.all(promise).then(() => {
          for (let idx = 0; idx < lastFvC.versionLst.length; idx++) {
            const version: FileVersionModel = lastFvC.versionLst[idx];
            const obj: VersionReturn = {
              date: moment(new Date(version.date.get())),
              versionNbr: version.versionId.get(),
            };
            try {
              obj.serverId = version.ptr.data.value;
            } catch (e) {
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

      const controllerOpenRegister = (funcOnChange, funcOnDestroy): Promise<any> => {
        factory.controllerOnChange = funcOnChange;
        factory.controllerDestroyFunc = funcOnDestroy;
        return FileVersionContainerModel.getVersionModelFromFile(factory.lastFile)
          .then((fvc) => {
            lastFvC = fvc;
            modelProcessBind = fvc.bind(onChangeModel);
          });
      };
      const controllerDestroy = () => {
        return FileVersionContainerModel.getVersionModelFromFile(factory.lastFile)
          .then((fvc) => {
            if (modelProcessBind !== null) {
              lastFvC.unbind(modelProcessBind);
            }
            factory.controllerDestroyFunc();
            factory.controllerOnChange = null;
          });
      };

      const addNewVersion = (file: File)
        : Promise<{ path: Promise<any>, filename: string, version: number }> => {
        return FileVersionContainerModel.getVersionModelFromFile(factory.lastFile).then(
          (fvc) => {
            const path = new Path(file);
            const newVersion = fvc.addVersion(path);
            return {
              path: dowloadPathCheck(path, $q),
              filename: factory.lastFile.name.get(),
              version: newVersion.versionId.get(),
            };
          });

      };
      const setVersion = (versionNbr: number | spinal.Val): Promise<void> => {
        return FileVersionContainerModel.getVersionModelFromFile(factory.lastFile).then(
          (fvc) => {
            fvc.setVersionById(versionNbr);
          });
      };

      const removeVersionById = (versionNbr: number | spinal.Val): Promise<Boolean> => {
        return FileVersionContainerModel.getVersionModelFromFile(factory.lastFile).then(
          (fvc) => {
            return fvc.removeVersionById(versionNbr);
          });
      };
      const getDescription = (versionNbr: number | spinal.Val): Promise<string> => {
        return FileVersionContainerModel.getVersionModelFromFile(factory.lastFile).then(
          (fvc) => {
            const description = fvc.getDescriptionById(versionNbr);
            return typeof description === 'undefined' ? '' : description.get();
          });
      };
      const setDescription = (versionNbr: number | spinal.Val, newDescription) => {
        return FileVersionContainerModel.getVersionModelFromFile(factory.lastFile).then(
          (fvc) => {
            const description = fvc.getDescriptionById(versionNbr);
            if (description) description.set(newDescription);
          });
      };

      init();
      const factory: FileVersionService = {
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
