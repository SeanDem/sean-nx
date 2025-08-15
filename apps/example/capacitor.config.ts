import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sean.test',
  appName: 'test-2',
  webDir: '../../dist/apps/test-2/browser',
  ios: {
    path: './ios/test-2/ios'
  },
  android: {
    path: './android/test-2/ios'
  }
};

export default config;
