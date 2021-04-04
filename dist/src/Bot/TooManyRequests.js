"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooManyRequests = void 0;
class TooManyRequests extends Error {
    constructor(username, error) {
        super(`(${username}) Too Many Requests: ${error}`);
    }
}
exports.TooManyRequests = TooManyRequests;
//# sourceMappingURL=TooManyRequests.js.map