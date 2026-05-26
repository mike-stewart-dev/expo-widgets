"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFrameworksToWidgetProject = void 0;
const addFrameworksToWidgetProject = (project, target) => {
    const frameworks = ['WidgetKit.framework', 'SwiftUI.framework'];
    for (const framework of frameworks) {
        project.addFramework(framework, {
            target: target.uuid,
            link: true,
        });
    }
    project.addBuildPhase(frameworks, 'PBXFrameworksBuildPhase', 'Frameworks', target.uuid);
};
exports.addFrameworksToWidgetProject = addFrameworksToWidgetProject;
