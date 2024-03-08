import { TranslationStrategy } from "./translation-strategy";
export declare class Wolpertinger<T extends TranslationStrategy> {
    private readonly _createTranslationStrategy;
    readonly scrFiles: string[];
    readonly srcStrings: string[];
    private readonly translationStrategy;
    private _isReadyToTranslate;
    private combinedTranslations;
    constructor(srcFile: string | string[] | undefined, srcString: string | string[] | undefined, _createTranslationStrategy: {
        new (): T;
    });
    private evaluateSources;
    loadSources(rejectWhenError: boolean): Promise<boolean>;
    get isReadyToTranslate(): boolean;
    translateAll(errorText: string | undefined): Promise<boolean>;
}
