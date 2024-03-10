import { Translation } from "./translation-strategy";
export declare class Database {
    private readonly afterOpening;
    static readonly DB_NAME: string;
    static readonly DB_VERSION: number;
    static readonly DB_STORE_NAME_SAVED_FILES: string;
    protected static readonly INDEX_NAME_SAVED_URL: string;
    protected static readonly INDEX_NAME_TIMESTAMP: string;
    static readonly DB_STORE_NAME_SAVED_TRANSLATIONS: string;
    protected static readonly INDEX_NAME_FILE_ID: string;
    protected static readonly INDEX_NAME_KEY: string;
    protected static readonly INDEX_NAME_LANGUAGE: string;
    protected static readonly INDEX_NAME_TRANSLATION: string;
    protected dbInstance: IDBDatabase | undefined;
    protected filesStore: IDBObjectStore | undefined;
    protected translationsStore: IDBObjectStore | undefined;
    constructor(afterOpening: ((success: boolean) => void));
    protected createDatabase(event: IDBVersionChangeEvent): void;
    get savedFilesStore(): IDBObjectStore;
    get savedTranslationsStore(): IDBObjectStore;
    saveTranslations(fileId: number, translations: Translation[]): void;
    addFileEntry(url: string): Promise<number>;
    areTranslationsSaved(url: string): Promise<FileDatabaseEntry | undefined>;
    getTranslationsWithFileId(fileId: number): Promise<TranslationDatabaseEntry[]>;
}
