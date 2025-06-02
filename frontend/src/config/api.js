// API Configuration
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-the-ordinary.vercel.app' // Replace with your actual backend URL when deployed
  : 'http://localhost:5000';

export default API_URL;
