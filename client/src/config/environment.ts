// Environment configuration
interface Config {
  socketUrl: string;
  apiBaseUrl: string;
}

const config: Config = {
  // Socket configuration
  socketUrl: process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000',
  
  // API configuration
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api',
};

export default config;
