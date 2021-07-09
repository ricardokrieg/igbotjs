"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotFound = void 0;
class UserNotFound extends Error {
    constructor(username) {
        super(`User Not Found: ${username}`);
    }
}
exports.UserNotFound = UserNotFound;
//# sourceMappingURL=AccountNotFound.js.map
