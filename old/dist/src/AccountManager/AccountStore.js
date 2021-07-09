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
exports.AccountStore = void 0;
const lodash_1 = require("lodash");
require("firebase/firestore");
const _debug = __importStar(require("debug"));
const debug = _debug.debug('AccountStore');
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const _serviceAccount = __importStar(require("../../res/serviceAccount.json"));
const AccountNotFound_1 = require("./AccountNotFound");
const serviceAccount = {
    projectId: _serviceAccount.project_id,
    clientEmail: _serviceAccount.client_email,
    privateKey: _serviceAccount.private_key,
};
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
    databaseURL: 'https://instagram-bot-js.firebaseio.com',
});
const firestore = firebase_admin_1.default.firestore();
const accountsCol = firestore.collection('accounts');
class AccountStore {
    static find(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = accountsCol.doc(username);
            const snapshot = yield doc.get();
            if (!snapshot.exists) {
                throw new AccountNotFound_1.AccountNotFound(username);
            }
            return Promise.resolve(AccountStore.buildAccountFromData(snapshot.data()));
        });
    }
    static all() {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshot = yield accountsCol.get();
            const accounts = lodash_1.map(snapshot.docs, doc => AccountStore.buildAccountFromData(doc.data()));
            return Promise.resolve(accounts);
        });
    }
    static save(account) {
        return __awaiter(this, void 0, void 0, function* () {
            yield accountsCol.doc(account.username).set(account, { merge: true });
            return Promise.resolve();
        });
    }
    static buildAccountFromData(data) {
        return Object.assign({}, data);
    }
}
exports.AccountStore = AccountStore;
//# sourceMappingURL=AccountStore.js.map