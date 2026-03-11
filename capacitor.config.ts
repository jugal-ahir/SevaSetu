import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sevasetu.app',
  appName: 'sevasetu',
  webDir: 'public',
  server: {
    url: 'http://10.168.52.43',
    cleartext: true
  }
};

export default config;
