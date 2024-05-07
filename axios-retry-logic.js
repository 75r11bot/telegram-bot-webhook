const axios = require("axios");
const axiosRetry = require("axios-retry");

// Configure axios to use retry logic
axiosRetry(axios, {
  retries: 3, // Maximum number of retries
  retryDelay: axiosRetry.exponentialDelay, // Delay in milliseconds before retrying
  retryCondition: (error) => {
    // Retry if the error is "socket hang up"
    return error.code === "ECONNRESET";
  },
});

async function performRequestWithRetry(options) {
  try {
    // Perform the request
    const response = await axios(options);
    return response.data;
  } catch (error) {
    throw error;
  }
}

module.exports = performRequestWithRetry;
