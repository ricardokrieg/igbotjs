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
const lodash_1 = require("lodash");
const selenium_webdriver_1 = require("selenium-webdriver");
const chrome_1 = __importDefault(require("selenium-webdriver/chrome"));
const path_1 = __importDefault(require("path"));
const _debug = __importStar(require("debug"));
const debug = _debug.debug('DizuBrowser');
var SeleniumPlatform;
(function (SeleniumPlatform) {
    SeleniumPlatform[SeleniumPlatform["Mac"] = 0] = "Mac";
    SeleniumPlatform[SeleniumPlatform["Windows"] = 1] = "Windows";
})(SeleniumPlatform || (SeleniumPlatform = {}));
class DizuBrowser {
    constructor(platform) {
        const absolutePath = path_1.default.resolve(DizuBrowser.getPathFromPlatform(platform));
        debug(`ChromeDriver path: ${absolutePath}`);
        const service = new chrome_1.default.ServiceBuilder(absolutePath).build();
        chrome_1.default.setDefaultService(service);
        const userDataDir = DizuBrowser.getProfileFromPlatform(platform);
        this.chromeCapabilities = selenium_webdriver_1.Capabilities.chrome();
        this.chromeCapabilities.set('goog:chromeOptions', {
            args: [
                `--user-data-dir=${userDataDir}`,
            ],
            w3c: false,
        });
    }
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            this.driver = yield new selenium_webdriver_1.Builder().withCapabilities(this.chromeCapabilities).build();
        });
    }
    quit() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.driver.quit();
        });
    }
    getTask(user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.driver.get('https://dizu.com.br/painel/conectar');
            let element = yield this.driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id('instagram_id')), 10000);
            yield DizuBrowser.selectByVisibleText(element, user.username);
            element = yield this.driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id('iniciarTarefas')), 10000);
            yield element.click();
            element = yield this.driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.linkText('Ver link')), 10000);
            const href = yield element.getAttribute('href');
            return lodash_1.last(href.split('/'));
        });
    }
    submitTask() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id('conectar_form')), 10000)).submit();
        });
    }
    static mac() {
        return new DizuBrowser(SeleniumPlatform.Mac);
    }
    static windows() {
        return new DizuBrowser(SeleniumPlatform.Windows);
    }
    static getProfileFromPlatform(platform) {
        switch (platform) {
            case SeleniumPlatform.Mac:
                return '/Users/wolf/Library/Application Support/Google/Chrome/Profile 2';
            case SeleniumPlatform.Windows:
                return 'C:\\Users\\Dorinha Andrade\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1';
            default:
                return '';
        }
    }
    static getPathFromPlatform(platform) {
        switch (platform) {
            case SeleniumPlatform.Mac:
                return '../bin/chromedriver';
            case SeleniumPlatform.Windows:
                return '..\\bin\\chromedriver.exe';
            default:
                return '';
        }
    }
    static selectByVisibleText(element, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = yield element.findElements(selenium_webdriver_1.By.tagName('option'));
            for (let option of options) {
                const optionText = yield option.getText();
                if (optionText === text) {
                    return yield option.click();
                }
            }
        });
    }
}
exports.default = DizuBrowser;
//# sourceMappingURL=AccountManager.js.map
