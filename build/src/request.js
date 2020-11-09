"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
const qs_1 = __importDefault(require("qs"));
const axios_cookiejar_support_1 = __importDefault(require("axios-cookiejar-support"));
const tough = __importStar(require("tough-cookie"));
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
    axios_cookiejar_support_1.default(request);
    request.defaults.jar = new tough.CookieJar();
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