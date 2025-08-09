// Environment configuration for React Native app
// You can create different .env files for different environments

const ENV = {
  development: {
    API_BASE_URL: 'http://192.168.0.102:3000',
    GEMINI_API_KEY: 'AIzaSyBxLDGLgGQeBzDDsNtSNv7IdymwMPkEFig',
  },
  production: {
    API_BASE_URL: 'https://your-production-api.com',
    GEMINI_API_KEY: 'your-production-gemini-key',
  },
};

// Get current environment (default to development)
const getEnvVars = () => {
  // In React Native, you can use __DEV__ to determine environment
  if (__DEV__) {
    return ENV.development;
  }
  return ENV.production;
};

export default getEnvVars();
