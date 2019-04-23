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
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const loadModelPtr_1 = require("../utils/loadModelPtr");
class FileVersionModel extends spinal_core_connectorjs_type_1.Model {
    constructor(version, target) {
        super();
        if (typeof version !== 'undefined' || typeof target !== 'undefined') {
            this.add_attr('versionId', version);
            this.add_attr('ptr', new spinal_core_connectorjs_type_1.Ptr(target));
            this.add_attr('date', Date.now());
            this.add_attr('description', '');
        }
    }
}
exports.FileVersionModel = FileVersionModel;
class FileVersionContainerModel extends spinal_core_connectorjs_type_1.Model {
    static createFileVersion(file) {
        const fileVersionContainerModel = new FileVersionContainerModel(file._ptr);
        file._info.add_attr('version', new spinal_core_connectorjs_type_1.Ptr(fileVersionContainerModel));
        return fileVersionContainerModel;
    }
    static getVersionModelFromFile(file) {
        if (file && file._info && file._info.version) {
            try {
                return loadModelPtr_1.loadModelPtr(file._info.version);
            }
            catch (e) {
                return Promise.resolve(FileVersionContainerModel.createFileVersion(file));
            }
        }
        return Promise.resolve(FileVersionContainerModel.createFileVersion(file));
    }
    constructor(filePtr) {
        super();
        if (typeof filePtr !== 'undefined') {
            this.add_attr('current', filePtr);
            this.add_attr('versionLst', new spinal_core_connectorjs_type_1.Lst());
            this.add_attr('currentID', 0);
            this.add_attr('currentVersion', new spinal_core_connectorjs_type_1.Ptr(0));
            this.addVersion(this.current.data.value, true);
        }
    }
    addVersion(path, setAsCurrent = true) {
        // get Max ID from list
        let maxIdx = 0;
        for (let idx = 0; idx < this.versionLst.length; idx++) {
            const versionId = this.versionLst[idx].versionId.get();
            if (versionId > maxIdx) {
                maxIdx = versionId;
            }
        }
        // create a new versionModel
        const newVersion = new FileVersionModel(++maxIdx, path);
        // push the model
        this.versionLst.push(newVersion);
        if (setAsCurrent === true) {
            this.current.set(path);
            this.currentID.set(newVersion.versionId.get());
            this.currentVersion.set(newVersion);
        }
        return newVersion;
    }
    setVersionById(versionId) {
        const compuVersionId = typeof versionId === 'number' ? versionId : versionId.get();
        for (let idx = 0; idx < this.versionLst.length; idx++) {
            const version = this.versionLst[idx];
            if (version.versionId.get() === compuVersionId) {
                this.current.set(version.ptr.data.value);
                this.currentID.set(compuVersionId);
                this.currentVersion.set(version);
                return true;
            }
        }
        return false;
    }
    removeVersionById(versionId) {
        const compuVersionId = typeof versionId === 'number' ? versionId : versionId.get();
        for (let idx = 0; idx < this.versionLst.length; idx++) {
            const version = this.versionLst[idx];
            if (version.versionId.get() === compuVersionId) {
                this.versionLst.splice(idx, 1);
                return true;
            }
        }
        return false;
    }
    getDescriptionById(versionId) {
        const compuVersionId = typeof versionId === 'number' ? versionId : versionId.get();
        for (let idx = 0; idx < this.versionLst.length; idx++) {
            const version = this.versionLst[idx];
            if (version.versionId.get() === compuVersionId) {
                return version.description;
            }
        }
        return undefined;
    }
}
exports.FileVersionContainerModel = FileVersionContainerModel;
spinal_core_connectorjs_type_1.spinalCore.register_models([FileVersionContainerModel, FileVersionModel]);
//# sourceMappingURL=FileVersionModel.js.map