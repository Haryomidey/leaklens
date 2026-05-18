export const defaultSettings = {
  activeVerification: true,
  authProfile: 'currentSession' as 'anonymous' | 'currentSession',
  autoScan: true,
  bundleAnalysis: true,
  overlays: true,
  lowConfidence: false,
  sourceMaps: true,
  buckets: true,
  configs: true,
  dependencyCves: true,
  severityMode: 'serious' as 'serious' | 'audit',
};

export type SettingsState = typeof defaultSettings;

export function mergeSettings(settings?: Partial<SettingsState>): SettingsState {
  return {...defaultSettings, ...settings};
}
