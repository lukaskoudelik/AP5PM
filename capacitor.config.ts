import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.footballservice.app',
  appName: 'Fotbalový servis',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#144330",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,

    },
  },
};

export default config;
