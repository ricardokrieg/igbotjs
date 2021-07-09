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
exports.DizuTaskProvider = void 0;
const lodash_1 = require("lodash");
const selenium_webdriver_1 = require("selenium-webdriver");
const chrome_1 = __importDefault(require("selenium-webdriver/chrome"));
const path_1 = __importDefault(require("path"));
const debug_1 = __importDefault(require("debug"));
const TaskProvider_1 = require("../TaskProvider");
const NoTask_1 = require("../NoTask");
const debug = debug_1.default('DizuTaskProvider');
var SeleniumPlatform;
(function (SeleniumPlatform) {
    SeleniumPlatform[SeleniumPlatform["Mac"] = 0] = "Mac";
    SeleniumPlatform[SeleniumPlatform["Windows"] = 1] = "Windows";
})(SeleniumPlatform || (SeleniumPlatform = {}));
class DizuTaskProvider {
    constructor() {
        this.GET_TASK_URL = 'https://dizu.com.br/painel/conectar';
        this.platform = DizuTaskProvider.detectPlatform();
    }
    getTask(taskRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureDriver();
            let task;
            do {
                const href = yield this.getTaskLink(taskRequest);
                debug(href);
                const splitHref = href.split('/');
                if (splitHref[splitHref.length - 2] === 'p') {
                    debug('Skipping "Like" task');
                    continue;
                }
                const username = lodash_1.last(splitHref);
                task = { id: '', username, method: TaskProvider_1.TaskMethod.Follow };
            } while (!task);
            return Promise.resolve(task);
        });
    }
    getTaskLink(taskRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.driver.get(this.GET_TASK_URL);
            let element = yield this.driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id('instagram_id')), 10000);
            yield DizuTaskProvider.selectByVisibleText(element, taskRequest.tasker.username);
            element = yield this.driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id('iniciarTarefas')), 10000);
            yield element.click();
            try {
                element = yield this.driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.linkText('Ver link')), 10000);
            }
            catch (err) {
                if (err.message.includes('Wait timed out after')) {
                    element = yield this.driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.className('semTarefas')), 1000);
                    if (element.length) {
                        throw new NoTask_1.NoTask(taskRequest);
                    }
                }
                throw err;
            }
            return element.getAttribute('href');
        });
    }
    confirmTask(taskConfirmation) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.driver)
                return Promise.resolve();
            if (taskConfirmation.status === TaskProvider_1.TaskStatus.Error) {
                yield this.driver.executeScript("$('[name=realizado]').value = '3'");
            }
            return (yield this.driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id('conectar_form')), 10000)).submit();
        });
    }
    quit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.driver)
                return Promise.resolve();
            return this.driver.quit();
        });
    }
    ensureDriver() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.driver) {
                const capabilities = this.getCapabilities();
                this.driver = yield new selenium_webdriver_1.Builder().withCapabilities(capabilities).build();
            }
            return Promise.resolve();
        });
    }
    getCapabilities() {
        const absolutePath = path_1.default.resolve(this.getPath());
        const userDataDir = this.getProfile();
        debug(`ChromeDriver path: ${absolutePath}`);
        debug(`User Data Dir    : ${userDataDir}`);
        const service = new chrome_1.default.ServiceBuilder(absolutePath).build();
        chrome_1.default.setDefaultService(service);
        const capabilities = selenium_webdriver_1.Capabilities.chrome();
        capabilities.set('goog:chromeOptions', {
            args: [
                `--user-data-dir=${userDataDir}`,
            ],
            w3c: false,
        });
        return capabilities;
    }
    getPath() {
        switch (this.platform) {
            case SeleniumPlatform.Mac:
                return './bin/chromedriver';
            case SeleniumPlatform.Windows:
                return '.\\bin\\chromedriver.exe';
            default:
                return '';
        }
    }
    getProfile() {
        switch (this.platform) {
            case SeleniumPlatform.Mac:
                return '/Users/wolf/Library/Application Support/Google/Chrome/Profile 2';
            case SeleniumPlatform.Windows:
                return 'C:\\Users\\Dorinha Andrade\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1';
            default:
                return '';
        }
    }
    static detectPlatform() {
        if (process.platform === 'win32')
            return SeleniumPlatform.Windows;
        return SeleniumPlatform.Mac;
    }
    static selectByVisibleText(element, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = yield element.findElements(selenium_webdriver_1.By.tagName('option'));
            for (const option of options) {
                const optionText = yield option.getText();
                if (optionText === text) {
                    return yield option.click();
                }
            }
        });
    }
}
exports.DizuTaskProvider = DizuTaskProvider;
//# sourceMappingURL=DizuTaskProvider.js.map