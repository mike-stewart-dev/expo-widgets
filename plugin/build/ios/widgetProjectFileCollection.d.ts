type WidgetProjectFiles = {
    [key: string]: string[];
};
export declare class WidgetProjectFileCollection {
    private readonly _files;
    constructor();
    static fromFiles(files: string[]): WidgetProjectFileCollection;
    addFiles(files: string[]): void;
    addFile(file: string): void;
    getFiltered(): WidgetProjectFiles;
    getBundled(includeProjectLevelFiles?: boolean): string[];
}
export {};
