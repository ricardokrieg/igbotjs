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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Importer = void 0;
const fs_1 = __importDefault(require("fs"));
const _debug = __importStar(require("debug"));
const debug = _debug.debug('Importer');
const AccountStore_1 = require("./AccountStore");
class Importer {
    static importFromCurl(username, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            debug(`Importing ${username} from file ${filePath}`);
            const data = fs_1.default.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
            const account = this.buildAccountFromCurl(username, data);
            debug(account);
            return AccountStore_1.AccountStore.save(account);
        });
    }
    static buildAccountFromCurl(username, data) {
        const account = {
            username,
            password: 'xxx123xxx',
            taskProvider: 'Dizu',
            bot: 'Web',
        };
        const attrs = {
            igWwwClaim: /.*?x-ig-www-claim: (.*)'.*?/,
            instagramAjax: /.*?x-instagram-ajax: (.*)'.*?/,
            userAgent: /.*?user-agent: (.*)'.*?/,
            csrfToken: /.*?x-csrftoken: (.*)'.*?/,
            cookies: /.*?cookie: (.*)'.*?/,
        };
        let result;
        for (const line of data.split("\n")) {
            for (const [key, value] of Object.entries(attrs)) {
                result = line.match(value);
                if (result) {
                    account[key] = result[1];
                    break;
                }
            }
        }
        for (const key of Object.keys(attrs)) {
            if (!account[key]) {
                throw new Error(`CURL Request is missing attribute ${key}`);
            }
        }
        return account;
    }
}
exports.Importer = Importer;
//# sourceMappingURL=Importer.js.map