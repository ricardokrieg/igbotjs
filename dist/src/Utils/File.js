"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
const fs_1 = __importDefault(require("fs"));
class File {
    constructor(path) {
        this.file = fs_1.default.createWriteStream(path, { flags: 'a' });
    }
    append(text) {
        this.file.write(text);
    }
}
exports.File = File;
//# sourceMappingURL=File.js.map