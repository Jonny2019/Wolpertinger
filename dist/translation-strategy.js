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
exports.BestMatch = exports.AllSameLanguage = exports.TranslationStrategy = exports.Translation = void 0;
class Translation {
    constructor(key, text, language) {
        this.key = key;
        this.text = text;
        this.language = language;
    }
    matchesKey(key) {
        return this.key === key;
    }
}
exports.Translation = Translation;
class TranslationStrategy {
    constructor() {
        this.evaluatedTranslations = [];
        this.acceptedLanguages = this.allUniqueAcceptedLanguages();
        this.preferredLanguage = navigator.language.substring(0, 2);
    }
    allUniqueAcceptedLanguages() {
        return navigator.languages
            .map((value) => value.substring(0, 2))
            .filter((value, index, array) => array.indexOf(value) === index);
    }
    addTranslation(key, options) {
        this.evaluatedTranslations.push(this.applyStrategy(key, options));
    }
    translate(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                for (const translation of this.evaluatedTranslations) {
                    if (translation.matchesKey(key)) {
                        resolve(translation.text);
                        break;
                    }
                }
                reject("Not found");
            });
        });
    }
}
exports.TranslationStrategy = TranslationStrategy;
class AllSameLanguage extends TranslationStrategy {
    applyStrategy(key, options) {
        for (const option of options) {
            if (option.language === this.targetLanguage) {
                return option;
            }
        }
        throw Error("Failed to follow language requirement.");
    }
    findTargetLanguage(translations) {
        const occurrenceCounter = {};
        const possibleLanguages = [];
        translations.forEach((translation) => {
            translation.values.forEach((value) => {
                if (occurrenceCounter[value.lang] === undefined) {
                    occurrenceCounter[value.lang] = 1;
                    possibleLanguages.push(value.lang);
                }
                else {
                    occurrenceCounter[value.lang] = occurrenceCounter[value.lang] + 1;
                }
            });
        });
        possibleLanguages.forEach((lang, index) => {
            if (occurrenceCounter[lang] != translations.length) {
                possibleLanguages.splice(index, 1);
            }
        });
        if (possibleLanguages.length === 0) {
            throw Error("No language found that is supported for all translations.");
        }
        else if (possibleLanguages.length === 1) {
            this.targetLanguage = possibleLanguages[0];
        }
        else if (possibleLanguages.indexOf(this.preferredLanguage) != -1) {
            this.targetLanguage = this.preferredLanguage;
        }
        else {
            for (const possibleLanguage of possibleLanguages) {
                if (this.acceptedLanguages.indexOf(possibleLanguage) != -1) {
                    this.targetLanguage = possibleLanguage;
                    break;
                }
            }
            if (this.targetLanguage === undefined) {
                this.targetLanguage = possibleLanguages[0];
            }
        }
    }
    addTranslationsFromDatabase(translations) {
    }
}
exports.AllSameLanguage = AllSameLanguage;
class BestMatch extends TranslationStrategy {
    applyStrategy(key, options) {
        if (options.length === 0) {
            throw Error("No translation options were given.");
        }
        let currentBest;
        let bestLangIndex = -1;
        options.forEach((option) => {
            if (option.language === this.preferredLanguage) {
                currentBest = option;
                bestLangIndex = 0;
            }
            else {
                const langIndex = this.acceptedLanguages.indexOf(option.language);
                if (currentBest === undefined) {
                    currentBest = option;
                    bestLangIndex = langIndex;
                }
                else {
                    if (langIndex != -1 && langIndex < bestLangIndex) {
                        currentBest = option;
                        bestLangIndex = langIndex;
                    }
                }
            }
        });
        if (currentBest === undefined) {
            throw Error("Failed to find matching translation.");
        }
        else {
            return currentBest;
        }
    }
    findTargetLanguage(translations) {
    }
    addTranslationsFromDatabase(translations) {
    }
}
exports.BestMatch = BestMatch;
