// API Configuration

// Use environment detection to switch between local and production URLs
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://the-ordinary-ifxd.vercel.app' // Deployed backend URL
  : 'http://localhost:5000'; // Local development

export default API_URL;
