import ExpoWidgetsModule from './ExpoWidgetsModule';

export function setWidgetData(data: object, packageName: string): void {
  ExpoWidgetsModule.setWidgetData(JSON.stringify(data), packageName);
}

export function updateWidgetData(widgetId: string, data: object, packageName: string): void {
    ExpoWidgetsModule.updateWidgetData(widgetId, JSON.stringify(data), packageName);
}