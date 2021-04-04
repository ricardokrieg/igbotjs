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
exports.Exporter = void 0;
const _debug = __importStar(require("debug"));
const debug = _debug.debug('Exporter');
const AccountStore_1 = require("./AccountStore");
const File_1 = require("../Utils/File");
class Exporter {
    static exportAll(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            debug(`Exporting all accounts to ${filePath}`);
            const file = new File_1.File(filePath);
            const accounts = yield AccountStore_1.AccountStore.all();
            for (const account of accounts) {
                file.append(this.accountToCsv(account));
            }
            debug(`Exported ${accounts.length} accounts`);
            return Promise.resolve();
        });
    }
    static accountToCsv(account) {
        return `${account.username};${account.password}`;
    }
}
exports.Exporter = Exporter;
//# sourceMappingURL=Exporter.js.map