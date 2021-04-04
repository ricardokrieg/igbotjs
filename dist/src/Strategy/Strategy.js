"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strategy = void 0;
const _debug = __importStar(require("debug"));
const Sleep_1 = require("../Utils/Sleep");
const TaskProvider_1 = require("../TaskProvider/TaskProvider");
const DizuTaskProvider_1 = require("../TaskProvider/DizuTaskProvider/DizuTaskProvider");
const WebBot_1 = require("../Bot/WebBot");
const UserNotFound_1 = require("../Bot/UserNotFound");
const TooManyRequests_1 = require("../Bot/TooManyRequests");
const debug = _debug.debug('Strategy');
class Strategy {
    constructor(account) {
        this.account = account;
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