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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wolpertinger = void 0;
const translation_strategy_1 = require("./translation-strategy");
class Wolpertinger {
    constructor(srcFile, srcString, _createTranslationStrategy) {
        this._createTranslationStrategy = _createTranslationStrategy;
        this._isReadyToTranslate = false;
        this.combinedTranslations = [];
        this.translationStrategy = new this._createTranslationStrategy();
        if (srcFile != undefined || srcString != undefined) {
            if (srcFile != undefined) {
                if (typeof (srcFile) === "string") {
                    this.scrFiles = [srcFile];
                }
                else {
                    this.scrFiles = srcFile;
                }
            }
            else {
                this.scrFiles = [];
            }
            if (srcString != undefined) {
                if (typeof (srcString) === "string") {
                    this.srcStrings = [srcString];
                }
                else {
                    this.srcStrings = srcString;
                }
            }
            else {
                this.srcStrings = [];
            }
        }
        else {
            throw Error("Either a source file or a source string needs to be specified.");
        }
    }
    evaluateSources() {
        return __awaiter(this, void 0, void 0, function* () {
            const numberOfSources = this.scrFiles.length + this.srcStrings.length;
            let numberOfEvaluatedSources = 0;
            this.translationStrategy.findTargetLanguage(this.combinedTranslations);
            return new Promise((resolve) => {
                this.combinedTranslations.forEach((translationObject) => {
                    const key = translationObject.key;
                    const availableTranslations = [];
                    translationObject.values.forEach((pair) => {
                        availableTranslations.push(new translation_strategy_1.Translation(key, pair.value, pair.lang));
                    });
                    this.translationStrategy.addTranslation(key, availableTranslations);
                    numberOfEvaluatedSources++;
                    if (numberOfEvaluatedSources === numberOfSources) {
                        this._isReadyToTranslate = true;
                        resolve();
                    }
                });
            });
        });
    }
    loadSources(rejectWhenError) {
        return __awaiter(this, void 0, void 0, function* () {
            const numberOfSources = this.scrFiles.length + this.srcStrings.length;
            let numberOfLoadedSources = 0;
            return new Promise((resolve, reject) => {
                this.scrFiles.forEach((url) => {
                    fetch(url, {
                        method: "GET",
                        headers: {
                            Accept: "application/json"
                        },
                        cache: "default"
                    }).then((response) => response.json()).then(json => {
                        this.combinedTranslations = this.combinedTranslations.concat(json.translations);
                        numberOfLoadedSources++;
                        if (numberOfLoadedSources === numberOfSources) {
                            this.evaluateSources().then(() => {
                                resolve(true);
                            });
                        }
                    })
                        .catch(reason => {
                        numberOfLoadedSources++;
                        if (rejectWhenError) {
                            reject("Source could not be loaded or interpreted.");
                        }
                        else if (numberOfLoadedSources === numberOfSources) {
                            this._isReadyToTranslate = true;
                            resolve(true);
                        }
                        else {
                            resolve(false);
                        }
                    });
                });
                this.srcStrings.forEach((srcString) => {
                    this.combinedTranslations = this.combinedTranslations.concat(JSON.parse(srcString).translations);
                    numberOfLoadedSources++;
                    if (numberOfLoadedSources === numberOfSources) {
                        this.evaluateSources().then(() => {
                            resolve(true);
                        });
                    }
                });
            });
        });
    }
    get isReadyToTranslate() {
        return this._isReadyToTranslate;
    }
    translateAll(errorText) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this.isReadyToTranslate) {
                    for (const p of document.querySelectorAll("p, h1, h2, h3, h4, h5")) {
                        if (p.hasAttribute("data-translation")) {
                            const key = p.getAttribute("data-translation");
                            this.translationStrategy.translate(key).then((translation) => {
                                p.innerHTML = translation;
                            }).catch(reason => {
                                if (errorText != undefined) {
                                    p.innerHTML = errorText;
                                }
                            });
                        }
                    }
                    resolve(true);
                }
                else {
                    reject("Sources have not been evaluated yet.");
                }
            });
        });
    }
}
exports.Wolpertinger = Wolpertinger;
