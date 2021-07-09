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
const InstaRunner_1 = __importDefault(require("./InstaRunner"));
const dizu_browser_1 = __importStar(require("dizu-browser"));
const insta_web_bot_1 = __importDefault(require("insta-web-bot"));
const _debug = __importStar(require("debug"));
const debug = _debug.debug('InstaRunner:app');
(() => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = `ig_did=60B25B9C-792F-443B-A9DE-0946363905A7; ig_nrcb=1; mid=YGPWpgALAAExMIOsnQFE_NhJYu13; ds_user_id=47107115828; sessionid=47107115828%3AEyf8lBvc9c4AMB%3A4; csrftoken=8BsxV5p3KaZU7z4HoZOpAMt6fkSMsapx; rur=ATN`;
    const username = `test`;
    const webBot = new insta_web_bot_1.default(cookies);
    const browser = new dizu_browser_1.default(dizu_browser_1.SeleniumPlatform.Mac);
    const runner = new InstaRunner_1.default(username, webBot, browser);
    yield runner.run();
    return Promise.resolve();
}))();
//# sourceMappingURL=app.js.map