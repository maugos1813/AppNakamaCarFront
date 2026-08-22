import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nakamacar.app',
  appName: 'NakamaCar',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;
