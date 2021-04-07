"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackRequired = void 0;
class FeedbackRequired extends Error {
    constructor(username, error) {
        super(`(${username}) Feedback Required: ${error}`);
    }
}
exports.FeedbackRequired = FeedbackRequired;
//# sourceMappingURL=FeedbackRequired.js.map