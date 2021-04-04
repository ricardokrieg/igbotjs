"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidAccount = void 0;
class InvalidAccount extends Error {
    constructor(username) {
        super(`Invalid Account: ${username}. A required param is missing.`);
    }
}
exports.InvalidAccount = InvalidAccount;
//# sourceMappingURL=InvalidAccount.js.map