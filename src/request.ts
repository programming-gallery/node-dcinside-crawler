import axios from 'axios';
import axiosRetry from 'axios-retry';
import qs from 'qs';
//import axiosRateLimit from 'axios-rate-limit';
const axiosRateLimit = require('axios-rate-limit');

export function create(rps=10, retries=5){
  let request = axiosRateLimit(
    axios.create({
      timeout: 2000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      transformRequest: data => qs.stringify(data),
    }),
    {
      maxRequests: rps,
      perMilliseconds: 1000,
    }
  );
  axiosRetry(request, {
    retries,
    retryDelay: axiosRetry.exponentialDelay, 
    shouldResetTimeout: true, 
    retryCondition: (error): boolean => {
      return axiosRetry.isNetworkOrIdempotentRequestError(error)
        || error.code === '429' 
        || error.response?.status == 429
        || error.code === 'ECONNABORTED'
    }
  });
  return request;
}
