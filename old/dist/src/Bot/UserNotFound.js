"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotFound = void 0;
class UserNotFound extends Error {
    constructor(username, error) {
        super(`(${username}) User Not Found: ${error}`);
    }
}
exports.UserNotFound = UserNotFound;
//# sourceMappingURL=UserNotFound.js.map