"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoTask = void 0;
class NoTask extends Error {
    constructor(taskRequest) {
        super(`No more tasks available for ${taskRequest.tasker.username}`);
    }
}
exports.NoTask = NoTask;
//# sourceMappingURL=NoTask.js.map