declare class Logger {
    readonly showDebug: boolean;
    readonly consoleAvailable: boolean;
    constructor();
    debug(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
}
export declare class Logging {
    private static instance?;
    static get logger(): Logger;
}
export {};
