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
exports.Database = void 0;
class Database {
    constructor(afterOpening) {
        this.afterOpening = afterOpening;
        const openingRequest = indexedDB.open(Database.DB_NAME, Database.DB_VERSION);
        openingRequest.onsuccess = (event) => {
            this.dbInstance = openingRequest.result;
            this.afterOpening(true);
        };
        openingRequest.onerror = (event) => this.afterOpening(false);
        openingRequest.onupgradeneeded = this.createDatabase;
    }
    createDatabase(event) {
        const storeSavedFiles = event.currentTarget.result.createObjectStore(Database.DB_STORE_NAME_SAVED_FILES, {
            keyPath: "id",
            autoIncrement: true
        });
        storeSavedFiles.createIndex(Database.INDEX_NAME_SAVED_URL, Database.INDEX_NAME_SAVED_URL, { unique: true });
        storeSavedFiles.createIndex(Database.INDEX_NAME_TIMESTAMP, Database.INDEX_NAME_TIMESTAMP, { unique: false });
        const storeSavedTranslations = event.currentTarget.result.createObjectStore(Database.DB_STORE_NAME_SAVED_TRANSLATIONS, {
            keyPath: "id",
            autoIncrement: true
        });
        storeSavedTranslations.createIndex(Database.INDEX_NAME_FILE_ID, Database.INDEX_NAME_FILE_ID, { unique: false });
        storeSavedTranslations.createIndex(Database.INDEX_NAME_KEY, Database.INDEX_NAME_KEY, { unique: false });
        storeSavedTranslations.createIndex(Database.INDEX_NAME_LANGUAGE, Database.INDEX_NAME_LANGUAGE, { unique: false });
        storeSavedTranslations.createIndex(Database.INDEX_NAME_TRANSLATION, Database.INDEX_NAME_TRANSLATION, { unique: false });
    }
    get savedFilesStore() {
        if (this.dbInstance != undefined) {
            const transaction = this.dbInstance.transaction(Database.DB_STORE_NAME_SAVED_FILES, "readwrite");
            return transaction.objectStore(Database.DB_STORE_NAME_SAVED_FILES);
        }
        else {
            throw Error("Tried to access object store before db creation.");
        }
    }
    get savedTranslationsStore() {
        if (this.dbInstance != undefined) {
            const transaction = this.dbInstance.transaction(Database.DB_STORE_NAME_SAVED_TRANSLATIONS, "readwrite");
            return transaction.objectStore(Database.DB_STORE_NAME_SAVED_TRANSLATIONS);
        }
        else {
            throw Error("Tried to access object store before db creation.");
        }
    }
    saveTranslations(fileId, translations) {
        translations.forEach((translation) => {
            const obj = {
                fileId: fileId,
                key: translation.key,
                language: translation.language,
                translation: translation.text
            };
            if (this.translationsStore === undefined)
                this.translationsStore = this.savedTranslationsStore;
            this.translationsStore.add(obj);
        });
    }
    addFileEntry(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this.filesStore === undefined)
                    this.filesStore = this.savedFilesStore;
                const obj = {
                    timestamp: Date.now(),
                    url: url
                };
                const addFileRequest = this.filesStore.add(obj);
                addFileRequest.onsuccess = (event) => {
                    const id = event.target.result;
                    resolve(id);
                };
                addFileRequest.onerror = (event) => {
                    reject();
                };
            });
        });
    }
    areTranslationsSaved(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                if (this.filesStore === undefined)
                    this.filesStore = this.savedFilesStore;
                const cursorRequest = this.filesStore.openCursor();
                cursorRequest.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        const entry = cursor.value;
                        if (entry.url === url) {
                            resolve(entry);
                        }
                        else {
                            cursor.continue();
                        }
                    }
                    else {
                        resolve(undefined);
                    }
                };
                cursorRequest.onerror = (event) => {
                    resolve(undefined);
                };
            });
        });
    }
    getTranslationsWithFileId(fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this.translationsStore === undefined) {
                    this.translationsStore = this.savedTranslationsStore;
                }
                const translations = [];
                const cursorRequest = this.translationsStore.openCursor();
                cursorRequest.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        const entry = cursor.value;
                        if (entry.fileId === fileId) {
                            translations.push(entry);
                        }
                        cursor.continue();
                    }
                    else {
                        resolve(translations);
                    }
                };
                cursorRequest.onerror = (event) => {
                    reject();
                };
            });
        });
    }
}
exports.Database = Database;
Database.DB_NAME = "wolpertinger-local-db";
Database.DB_VERSION = 1;
Database.DB_STORE_NAME_SAVED_FILES = "savedFiles";
Database.INDEX_NAME_SAVED_URL = "savedUrl";
Database.INDEX_NAME_TIMESTAMP = "timestamp";
Database.DB_STORE_NAME_SAVED_TRANSLATIONS = "savedTranslations";
Database.INDEX_NAME_FILE_ID = "fileId";
Database.INDEX_NAME_KEY = "key";
Database.INDEX_NAME_LANGUAGE = "language";
Database.INDEX_NAME_TRANSLATION = "translation";
