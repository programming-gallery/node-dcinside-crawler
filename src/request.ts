import axios from 'axios';
import axiosRetry from 'axios-retry';
import qs from 'qs';
//import axiosRateLimit from 'axios-rate-limit';
const axiosRateLimit = require('axios-rate-limit');

const request = axiosRateLimit(
  axios.create({
    timeout: 1000,
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
    transformRequest: data => qs.stringify(data),
  }),
  {
    maxRequests: 10,
    perMilliseconds: 100,
  }
);
axiosRetry(request, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true,
});

export default request;
