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
function dowloadPathCheck(path, qLib) {
    const q = qLib.defer();
    const interval = setInterval(() => {
        const remaining = (path.remaining).get();
        const toUpload = (path.to_upload).get();
        if (remaining !== 0) {
            const percent = (toUpload - remaining) /
                toUpload;
            q.notify(percent * 100);
        }
        else {
            clearInterval(interval);
            q.resolve();
        }
    }, 500);
    return q.promise;
}
exports.default = dowloadPathCheck;
//# sourceMappingURL=dowloadPathCheck.js.map