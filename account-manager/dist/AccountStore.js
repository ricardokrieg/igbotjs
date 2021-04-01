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
require("firebase/firestore");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const serviceAccount_json_1 = __importDefault(require("../res/serviceAccount.json"));
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount_json_1.default),
    databaseURL: 'https://instagram-bot-js.firebaseio.com',
});
const firestore = firebase_admin_1.default.firestore();
const accountsCol = firestore.collection('accounts');
class UserNotFound extends Error {
    constructor(username) {
        super(`User Not Found: ${username}`);
    }
}
class AccountStore {
    static find(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = accountsCol.doc(username);
            const snapshot = yield doc.get();
            if (!snapshot.exists) {
                throw new UserNotFound(username);
            }
            return AccountStore.buildUserFromData(username, snapshot.data());
        });
    }
    // static async all(): Promise<User[]> {
    //
    // }
    //
    // static async save(user: User) {
    //
    // }
    static buildUserFromData(username, data) {
        return {
            username,
        };
    }
}
exports.default = AccountStore;
//# sourceMappingURL=AccountStore.js.map