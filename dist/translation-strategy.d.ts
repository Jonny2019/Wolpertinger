export interface TranslationsArray {
    [key: string]: string;
}
export declare class Translation {
    private readonly key;
    readonly text: string;
    readonly language: string;
    constructor(key: string, text: string, language: string);
    matchesKey(key: string): boolean;
}
export declare abstract class TranslationStrategy {
    protected acceptedLanguages: string[];
    protected preferredLanguage: string;
    protected evaluatedTranslations: Translation[];
    protected targetLanguage: string | undefined;
    constructor();
    protected allUniqueAcceptedLanguages(): string[];
    addTranslation(key: string, options: Translation[]): void;
    abstract applyStrategy(key: string, options: Translation[]): Translation;
    abstract findTargetLanguage(translations: TranslationObject[]): void;
    translate(key: string): Promise<string>;
}
export declare class AllSameLanguage extends TranslationStrategy {
    applyStrategy(key: string, options: Translation[]): Translation;
    findTargetLanguage(translations: TranslationObject[]): void;
}
export declare class BestMatch extends TranslationStrategy {
    applyStrategy(key: string, options: Translation[]): Translation;
    findTargetLanguage(translations: TranslationObject[]): void;
}