"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetProjectFileCollection = void 0;
const logger_1 = require("../utils/logger");
const path_1 = __importDefault(require("path"));
class WidgetProjectFileCollection {
    _files;
    constructor() {
        this._files = {
            swift: [],
            entitlements: [],
            plist: [],
            xcassets: [],
            intentdefinition: [],
            strings: [],
        };
    }
    static fromFiles(files) {
        const collection = new WidgetProjectFileCollection();
        collection.addFiles(files);
        return collection;
    }
    addFiles(files) {
        for (const file of files) {
            this.addFile(file);
        }
    }
    addFile(file) {
        const extension = path_1.default.extname(file).substring(1);
        if (file === "Module.swift") {
            return;
        }
        else if (this._files.hasOwnProperty(extension)) {
            logger_1.Logging.logger.debug(`Adding file ${file}...`);
            logger_1.Logging.logger.debug(`Extension: ${extension}`);
            this._files[extension].push(file);
        }
    }
    getFiltered() {
        return this._files;
    }
    getBundled(includeProjectLevelFiles = false) {
        return Object.keys(this._files)
            .map(key => { return { files: this._files[key], key }; })
            .reduce((arr, { key, files }) => {
            if (!includeProjectLevelFiles && key === 'entitlements') {
                return arr;
            }
            return [...arr, ...files];
        }, []);
    }
}
exports.WidgetProjectFileCollection = WidgetProjectFileCollection;
