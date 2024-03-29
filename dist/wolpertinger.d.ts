import { TranslationStrategy } from "./translation-strategy";
export declare class Wolpertinger<T extends TranslationStrategy> {
    private readonly _createTranslationStrategy;
    private readonly useSavedTranslations;
    private readonly useLanguageCookie;
    static readonly ATTRIBUTE_NAME_TRANSLATION: string;
    static readonly ATTRIBUTE_NAME_LOCALIZED_IMAGE: string;
    static readonly ATTRIBUTE_NAME_LOCALIZED_ALT: string;
    readonly scrFiles: string[];
    readonly srcStrings: string[];
    private readonly translationStrategy;
    private _isReadyToTranslate;
    private combinedTranslations;
    private database;
    private sourcesCachedFromDB;
    constructor(srcFile: string | string[] | undefined, srcString: string | string[] | undefined, _createTranslationStrategy: {
        new (useLanguageCookie: boolean): T;
    }, useSavedTranslations?: boolean, useLanguageCookie?: boolean);
    private evaluateSources;
    fetchTranslationsFile(url: string): Promise<TranslationObject[]>;
    loadSources(rejectWhenError: boolean): Promise<boolean>;
    get isReadyToTranslate(): boolean;
    translateAll(errorText: string | undefined): Promise<boolean>;
}
