// API Configuration

/**
 * This module provides a centralized API URL configuration
 * It automatically switches between local development and production URLs
 */

// Force production API URL for now to fix connection issues
// This bypasses environment detection to use the deployed backend
const API_URL = 'https://the-ordinary-ifxd.vercel.app';

// Log the API URL being used to help with debugging
console.log('Using API URL:', API_URL);

// Export API URL for use throughout the app
export default API_URL;

// Helper to check if a request worked or if we should retry with the alternate URL
export const fallbackFetch = async (endpoint, options = {}) => {
  try {
    // First try with the default URL based on environment
    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (response.ok) return response;
    
    // If in production and primary URL fails, there might be a deployment issue
    throw new Error(`Request failed with status ${response.status}`);
  } catch (error) {
    console.error(`Error fetching from ${API_URL}${endpoint}:`, error);
    throw error;
  }
};
