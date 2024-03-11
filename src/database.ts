import {Translation} from "./translation-strategy";

export class Database {
    public static readonly DB_NAME: string = "wolpertinger-local-db";
    public static readonly DB_VERSION: number = 1;

    public static readonly DB_STORE_NAME_SAVED_FILES: string = "savedFiles";

    protected static readonly INDEX_NAME_SAVED_URL: string = "savedUrl";
    protected static readonly INDEX_NAME_TIMESTAMP: string = "timestamp";

    public static readonly DB_STORE_NAME_SAVED_TRANSLATIONS: string = "savedTranslations";

    protected static readonly INDEX_NAME_FILE_ID: string = "fileId";
    protected static readonly INDEX_NAME_KEY: string = "key";
    protected static readonly INDEX_NAME_LANGUAGE: string = "language";
    protected static readonly INDEX_NAME_TRANSLATION: string = "translation";

    protected dbInstance: IDBDatabase | undefined;
    protected filesStore: IDBObjectStore | undefined;
    protected translationsStore: IDBObjectStore | undefined;

    constructor(private readonly afterOpening: ((success: boolean) => void)) {
        const openingRequest: IDBOpenDBRequest = indexedDB.open(Database.DB_NAME, Database.DB_VERSION);

        openingRequest.onsuccess = (event: Event): void => {
            this.dbInstance = openingRequest.result;
            this.afterOpening(true);
        };

        openingRequest.onerror = (event: Event): void => this.afterOpening(false);

        openingRequest.onupgradeneeded = this.createDatabase
    }

    protected createDatabase(event: IDBVersionChangeEvent): void {
        const storeSavedFiles: IDBObjectStore = (event.currentTarget as IDBOpenDBRequest).result.createObjectStore(
            Database.DB_STORE_NAME_SAVED_FILES,
            {
                keyPath: "id",
                autoIncrement: true
            }
        );

        storeSavedFiles.createIndex(Database.INDEX_NAME_SAVED_URL, Database.INDEX_NAME_SAVED_URL, {unique: true});
        storeSavedFiles.createIndex(Database.INDEX_NAME_TIMESTAMP, Database.INDEX_NAME_TIMESTAMP, {unique: false});

        const storeSavedTranslations: IDBObjectStore = (event.currentTarget as IDBOpenDBRequest).result.createObjectStore(
            Database.DB_STORE_NAME_SAVED_TRANSLATIONS,
            {
                keyPath: "id",
                autoIncrement: true
            }
        );

        storeSavedTranslations.createIndex(Database.INDEX_NAME_FILE_ID, Database.INDEX_NAME_FILE_ID, {unique: false});
        storeSavedTranslations.createIndex(Database.INDEX_NAME_KEY, Database.INDEX_NAME_KEY, {unique: false});
        storeSavedTranslations.createIndex(Database.INDEX_NAME_LANGUAGE, Database.INDEX_NAME_LANGUAGE, {unique: false});
        storeSavedTranslations.createIndex(Database.INDEX_NAME_TRANSLATION, Database.INDEX_NAME_TRANSLATION, {unique: false});
    }

    public get savedFilesStore(): IDBObjectStore {
        if (this.dbInstance != undefined) {
            const transaction: IDBTransaction = this.dbInstance.transaction(Database.DB_STORE_NAME_SAVED_FILES, "readwrite");

            return transaction.objectStore(Database.DB_STORE_NAME_SAVED_FILES);
        } else {
            throw Error("Tried to access object store before db creation.");
        }
    }

    public get savedTranslationsStore(): IDBObjectStore {
        if (this.dbInstance != undefined) {
            const transaction: IDBTransaction = this.dbInstance.transaction(Database.DB_STORE_NAME_SAVED_TRANSLATIONS, "readwrite");

            return transaction.objectStore(Database.DB_STORE_NAME_SAVED_TRANSLATIONS);
        } else {
            throw Error("Tried to access object store before db creation.");
        }
    }

    public saveTranslations(fileId: number, translations: Translation[]): void {
        translations.forEach((translation: Translation) => {
            const obj: TranslationDatabaseEntryPrototype = {
                fileId: fileId,
                key: translation.key,
                language: translation.language,
                translation: translation.text
            };
            this.translationsStore = this.savedTranslationsStore;

            this.translationsStore.add(obj);
        });
    }

    public async addFileEntry(url: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.filesStore = this.savedFilesStore;

            const obj: FileDatabaseEntryPrototype = {
                timestamp: Date.now(),
                url: url
            };
            const addFileRequest: IDBRequest<IDBValidKey> = this.filesStore.add(obj);
            addFileRequest.onsuccess = (event: Event) => {
                const id: number = (event.target as IDBRequest).result;
                resolve(id);
            };
            addFileRequest.onerror = (event: Event) => {
                reject();
            };
        });
    }

    /*
    public async countSavedFiles(): Promise<number> {
        return new Promise((resolve, reject) => {
            if (this.filesStore === undefined)
                this.filesStore = this.savedFilesStore;

            const req: IDBRequest<number> = this.filesStore.count();
            req.onsuccess = (event: Event) => {
                const count: number = (event.target as IDBRequest<number>).result;
                resolve(count);
            };
            req.onerror = (event: Event) => reject;
        });
    }
    */

    public async areTranslationsSaved(url: string): Promise<FileDatabaseEntry | undefined> {
        return new Promise((resolve) => {
            this.filesStore = this.savedFilesStore;

            const cursorRequest: IDBRequest<IDBCursorWithValue | null> = this.filesStore.openCursor();
            cursorRequest.onsuccess = (event: Event) => {
                const cursor: IDBCursorWithValue | null = (event.target as IDBRequest).result;
                if (cursor) {
                    const entry: FileDatabaseEntry = cursor.value;
                    if (entry.url === url) {
                        resolve(entry);
                    } else {
                        cursor.continue();
                    }
                } else {
                    resolve(undefined);
                }
            }

            cursorRequest.onerror = (event: Event) => {
                resolve(undefined);
            };
        });
    }

    public async getTranslationsWithFileId(fileId: number): Promise<TranslationDatabaseEntry[]> {
        return new Promise((resolve, reject) => {
            this.translationsStore = this.savedTranslationsStore;

            const translations: TranslationDatabaseEntry[] = [];

            const cursorRequest: IDBRequest<IDBCursorWithValue | null> = this.translationsStore.openCursor();
            cursorRequest.onsuccess = (event: Event) => {
                const cursor: IDBCursorWithValue | null = (event.target as IDBRequest).result;
                if (cursor) {
                    const entry: TranslationDatabaseEntry = cursor.value;
                    if (entry.fileId === fileId) {
                        translations.push(entry);
                    }

                    cursor.continue()
                } else {
                    resolve(translations);
                }
            }

            cursorRequest.onerror = (event: Event) => {
                reject();
            };
        });
    }

}
