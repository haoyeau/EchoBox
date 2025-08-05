// Environment configuration
interface Config {
  socketUrl: string;
  apiBaseUrl: string;
}

const config: Config = {
  // Socket configuration
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',
  
  // API configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
};

export default config;
