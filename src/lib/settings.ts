export const defaultSettings = {
  autoScan: true,
  overlays: true,
  lowConfidence: false,
  sourceMaps: true,
  buckets: true,
  configs: true,
};

export type SettingsState = typeof defaultSettings;

export function mergeSettings(settings?: Partial<SettingsState>): SettingsState {
  return {...defaultSettings, ...settings};
}
