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
exports.CookieWorker = void 0;
class CookieWorker {
    static savePreferredLanguage(language) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                document.cookie = `${CookieWorker.COOKIE_NAME_PREFERRED_LANGUAGE} = ${language}`;
                if (CookieWorker.savedPreferredLanguage === language) {
                    resolve();
                }
                else {
                    reject();
                }
            });
        });
    }
    static get savedPreferredLanguage() {
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
            const nameAndValue = cookie.split("=");
            if (nameAndValue.length === 2) {
                if (nameAndValue[0].trim() === CookieWorker.COOKIE_NAME_PREFERRED_LANGUAGE) {
                    return nameAndValue[1].trim();
                }
            }
        }
        return undefined;
    }
}
exports.CookieWorker = CookieWorker;
CookieWorker.COOKIE_NAME_PREFERRED_LANGUAGE = "wolpertinger-preferred-language";
