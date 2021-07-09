"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidResponse = void 0;
class InvalidResponse extends Error {
    constructor(url, statusCode) {
        super(`Invalid Response: ${url}, status = ${statusCode}`);
    }
}
exports.InvalidResponse = InvalidResponse;
//# sourceMappingURL=InvalidResponse.js.map