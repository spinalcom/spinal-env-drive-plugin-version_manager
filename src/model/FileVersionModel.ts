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
import { Model, Ptr, Lst } from 'spinal-core-connectorjs_type';

import { loadModelPtr } from '../utils/loadModelPtr';

export class FileVersionModel extends Model {
  public versionId: spinal.Val;
  public ptr: spinal.Ptr<spinal.Path>;
  public date: spinal.Val;
  public description: spinal.Str;

  public items? : spinal.Lst<any>;
  public state? : spinal.Val;

  constructor(version: number, target: number | spinal.Model) {
    super();
    if (typeof version !== 'undefined' || typeof target !== 'undefined') {
      this.add_attr('versionId', version);
      this.add_attr('ptr', new Ptr(target));
      this.add_attr('date', Date.now());
      this.add_attr('description', '');
    }
  }
}

export class FileVersionContainerModel extends Model {
  public current: spinal.Ptr<spinal.Path>;
  public currentID: spinal.Val;
  public versionLst: spinal.Lst<FileVersionModel>;
  public currentVersion: spinal.Ptr<FileVersionModel>;

  public static createFileVersion(file: spinal.File<any>): FileVersionContainerModel {

    const fileVersionContainerModel = new FileVersionContainerModel(file._ptr);
    file._info.add_attr('version', new Ptr(fileVersionContainerModel));
    return fileVersionContainerModel;
  }

  public static getVersionModelFromFile(file: spinal.File<any>)
    : Promise<FileVersionContainerModel> {
    if (file && file._info && file._info.version) {
      try {
        return loadModelPtr(file._info.version);
      } catch (e) {
        return Promise.resolve(FileVersionContainerModel.createFileVersion(file));
      }
    }
    return Promise.resolve(FileVersionContainerModel.createFileVersion(file));
  }

  constructor(filePtr?: spinal.Ptr<spinal.Path>) {
    super();
    if (typeof filePtr !== 'undefined') {
      this.add_attr('current', filePtr);
      this.add_attr('versionLst', new Lst());
      this.add_attr('currentID', 0);
      this.add_attr('currentVersion', new Ptr(0));
      this.addVersion(this.current.data.value, true);
    }
  }
  addVersion(path: number | spinal.Path, setAsCurrent: boolean = true): FileVersionModel {
    // get Max ID from list
    let maxIdx = 0;
    for (let idx = 0; idx < this.versionLst.length; idx++) {
      const versionId: number = this.versionLst[idx].versionId.get();
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

  setVersionById(versionId: number | spinal.Val): boolean {
    const compuVersionId = typeof versionId === 'number' ? versionId : versionId.get();
    for (let idx = 0; idx < this.versionLst.length; idx++) {
      const version: FileVersionModel = this.versionLst[idx];
      if (version.versionId.get() === compuVersionId) {
        this.current.set(version.ptr.data.value);
        this.currentID.set(compuVersionId);
        this.currentVersion.set(version);
        return true;
      }
    }
    return false;
  }
  removeVersionById(versionId: number | spinal.Val): boolean {
    const compuVersionId = typeof versionId === 'number' ? versionId : versionId.get();
    for (let idx = 0; idx < this.versionLst.length; idx++) {
      const version: FileVersionModel = this.versionLst[idx];
      if (version.versionId.get() === compuVersionId) {
        this.versionLst.splice(idx, 1);
        return true;
      }
    }
    return false;
  }

  getDescriptionById(versionId: number | spinal.Val): spinal.Str {
    const compuVersionId = typeof versionId === 'number' ? versionId : versionId.get();
    for (let idx = 0; idx < this.versionLst.length; idx++) {
      const version: FileVersionModel = this.versionLst[idx];
      if (version.versionId.get() === compuVersionId) {
        return version.description;
      }
    }
    return undefined;
  }

}
