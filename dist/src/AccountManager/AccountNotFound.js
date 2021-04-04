"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountNotFound = void 0;
class AccountNotFound extends Error {
    constructor(username) {
        super(`Account Not Found: ${username}`);
    }
}
exports.AccountNotFound = AccountNotFound;
//# sourceMappingURL=AccountNotFound.js.map