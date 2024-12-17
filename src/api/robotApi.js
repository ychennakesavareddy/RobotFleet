import axios from 'axios';

// API base URL
const BASE_URL = 'http://127.0.0.1:5000/api/robot';

// Function to get robots data
export const getRobots = async (statusFilter, batteryFilter) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        status: statusFilter,
        battery: batteryFilter
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching robots:', error);
    throw error;
  }
};
