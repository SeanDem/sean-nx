import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sean.nx.tip.calc',
  appName: 'tip-calc',
  webDir: '../../dist/apps/tip-calc/browser',
  server: {
    androidScheme: 'https',
    url: 'http://192.168.6.21:5173',
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;
