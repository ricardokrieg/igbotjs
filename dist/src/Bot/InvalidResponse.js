"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidResponse = void 0;
class InvalidResponse extends Error {
    constructor(username, statusCode) {
        super(`Invalid Response: ${username}, status = ${statusCode}`);
    }
}
exports.InvalidResponse = InvalidResponse;
//# sourceMappingURL=InvalidResponse.js.map