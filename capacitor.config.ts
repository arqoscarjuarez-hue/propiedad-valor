import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3ec5020c6e84458187250120596969e6',
  appName: 'propiedad-valor',
  webDir: 'dist',
  server: {
    url: 'https://3ec5020c-6e84-4581-8725-0120596969e6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;