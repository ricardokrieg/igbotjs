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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strategy = void 0;
const debug_1 = __importDefault(require("debug"));
const Sleep_1 = require("../Utils/Sleep");
const TaskProvider_1 = require("../TaskProvider/TaskProvider");
const DizuTaskProvider_1 = require("../TaskProvider/DizuTaskProvider/DizuTaskProvider");
const WebBot_1 = require("../Bot/WebBot");
const UserNotFound_1 = require("../Bot/UserNotFound");
const TooManyRequests_1 = require("../Bot/TooManyRequests");
let debug = debug_1.default('Strategy');
class Strategy {
    constructor(account) {
        this.account = account;
        debug = debug.extend(account.username);
    }
    start(followCount) {
        return __awaiter(this, void 0, void 0, function* () {
            const taskProvider = new DizuTaskProvider_1.DizuTaskProvider();
            const webBot = new WebBot_1.WebBot(this.account);
            try {
                let i = 1;
                while (i <= followCount) {
                    debug(`Task #${i}`);
                    if (i > 1) {
                        yield Sleep_1.Sleep(5000);
                    }
                    const task = yield taskProvider.getTask({ tasker: this.account });
                    debug(task);
                    if (task.method === TaskProvider_1.TaskMethod.Follow) {
                        try {
                            yield webBot.follow(task.username);
                            yield taskProvider.confirmTask({ task, status: TaskProvider_1.TaskStatus.Success });
                        }
                        catch (err) {
                            yield taskProvider.confirmTask({ task, status: TaskProvider_1.TaskStatus.Error });
                            if (err instanceof UserNotFound_1.UserNotFound) {
                                debug(err);
                            }
                            else if (err instanceof TooManyRequests_1.TooManyRequests) {
                                debug(err);
                                yield Sleep_1.Sleep(120000);
                            }
                            else {
                                throw err;
                            }
                        }
                    }
                    i++;
                }
            }
            finally {
                yield taskProvider.quit();
            }
        });
    }
}
exports.Strategy = Strategy;
//# sourceMappingURL=Strategy.js.map