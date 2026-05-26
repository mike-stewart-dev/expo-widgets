"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logging = void 0;
// very simple logger to avoid poluting end users with debug messages
class Logger {
    showDebug = false;
    consoleAvailable = false;
    constructor() {
        if (typeof process?.env !== 'undefined') {
            this.showDebug = process.env.NODE_ENV?.toLowerCase() === 'development' || false;
        }
        this.consoleAvailable = typeof console !== 'undefined';
    }
    debug(message, ...optionalParams) {
        if (!this.showDebug || !this.consoleAvailable) {
            return;
        }
        console.debug(message, ...optionalParams);
    }
    warn(message, ...optionalParams) {
        if (!this.consoleAvailable) {
            return;
        }
        console.warn(message, optionalParams);
    }
}
class Logging {
    static instance;
    static get logger() {
        if (!this.instance) {
            this.instance = new Logger();
        }
        return this.instance;
    }
}
exports.Logging = Logging;
