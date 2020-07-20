"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
const qs_1 = __importDefault(require("qs"));
//import axiosRateLimit from 'axios-rate-limit';
const axiosRateLimit = require('axios-rate-limit');
const request = axiosRateLimit(axios_1.default.create({
    timeout: 1000,
    headers: {
        'User-Agent': 'Mozilla/5.0',
    },
    transformRequest: data => qs_1.default.stringify(data),
}), {
    maxRequests: 10,
    perMilliseconds: 100,
});
axios_retry_1.default(request, {
    retries: 3,
    retryDelay: axios_retry_1.default.exponentialDelay,
    shouldResetTimeout: true,
});
exports.default = request;
//# sourceMappingURL=request.js.map