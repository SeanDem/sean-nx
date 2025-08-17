import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sean.nx.tip.calc',
  appName: 'tip-calc',
  webDir: '../../dist/apps/tip-calc',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
};

export default config;
