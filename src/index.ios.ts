import ExpoWidgetsModule from './ExpoWidgetsModule';

export function setWidgetData(data: object): void {
  ExpoWidgetsModule.setWidgetData(JSON.stringify(data));
}

export function updateWidgetData(kind: string, data: object): void {
    ExpoWidgetsModule.updateWidgetData(kind, JSON.stringify(data));
}
