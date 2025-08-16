import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sean.nx.example',
  appName: 'example',
  webDir: '../../dist/apps/example/browser',
  ios: { path: './ios' },
  android: { path: './android' }
};

export default config;
