"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
const qs_1 = __importDefault(require("qs"));
//import axiosRateLimit from 'axios-rate-limit';
const axiosRateLimit = require('axios-rate-limit');
function create(rps = 10, retries = 5) {
    let request = axiosRateLimit(axios_1.default.create({
        timeout: 2000,
        headers: {
            'User-Agent': 'Mozilla/5.0',
        },
        transformRequest: data => qs_1.default.stringify(data),
    }), {
        maxRequests: rps,
        perMilliseconds: 1000,
    });
    axios_retry_1.default(request, {
        retries,
        retryDelay: axios_retry_1.default.exponentialDelay,
        shouldResetTimeout: true,
        retryCondition: (error) => {
            var _a;
            return axios_retry_1.default.isNetworkOrIdempotentRequestError(error)
                || error.code === '429'
                || ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) == 429
                || error.code === 'ECONNABORTED';
        }
    });
    return request;
}
exports.create = create;
//# sourceMappingURL=request.js.map