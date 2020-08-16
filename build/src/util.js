"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseIterator = exports.AsyncQueue = void 0;
//const Queue = require("denque");
const denque_1 = __importDefault(require("denque"));
//const PriorityQueue = require("tinyqueue");
class AsyncQueue {
    constructor() {
        //this.q = new PriorityQueue(...args);
        this.resolverQ = new denque_1.default();
        this.q = new denque_1.default();
    }
    push(val) {
        let resolver = this.resolverQ.shift();
        if (resolver !== undefined)
            resolver(val);
        else
            this.q.push(val);
    }
    pop() {
        return __awaiter(this, void 0, void 0, function* () {
            let next = this.q.shift();
            if (next !== undefined)
                return next;
            else
                return new Promise(resolver => this.resolverQ.push(resolver));
        });
    }
}
exports.AsyncQueue = AsyncQueue;
function PromiseIterator(promises) {
    return __asyncGenerator(this, arguments, function* PromiseIterator_1() {
        let q = new AsyncQueue();
        promises.map(p => p.then(r => q.push({ success: true, result: r })).catch(e => q.push({ success: false, error: e })));
        for (let i = 0; i < promises.length; ++i) {
            yield yield __await(yield __await(q.pop()));
        }
    });
}
exports.PromiseIterator = PromiseIterator;
//# sourceMappingURL=util.js.map