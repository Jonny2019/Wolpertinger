import {TranslationStrategy, Translation} from "./translation-strategy";
import {Database} from "./database";

export class Wolpertinger<T extends TranslationStrategy> {
    public static readonly ATTRIBUTE_NAME_TRANSLATION: string = "data-translation";
    public static readonly ATTRIBUTE_NAME_LOCALIZED_IMAGE: string = "data-localized-img";
    public static readonly ATTRIBUTE_NAME_LOCALIZED_ALT: string = "data-localized-alt";

    public readonly scrFiles: string[];
    public readonly srcStrings: string[];
    private readonly translationStrategy: T;
    private _isReadyToTranslate: boolean = false;
    private combinedTranslations: TranslationObject[] = [];
    private database: Database | undefined;
    private sourcesCachedFromDB: number = 0;

    constructor(
        srcFile: string | string[] | undefined,
        srcString: string | string[] | undefined,
        private readonly _createTranslationStrategy: {new(useLanguageCookie: boolean): T},
        private readonly useSavedTranslations: boolean = true,
        private readonly useLanguageCookie: boolean = true
    ) {
        this.translationStrategy = new this._createTranslationStrategy(this.useLanguageCookie);

        if (srcFile != undefined || srcString != undefined) {
            if (srcFile != undefined) {
                if (typeof(srcFile) === "string") {
                    this.scrFiles = [srcFile];
                } else {
                    this.scrFiles = srcFile;
                }
            } else {
                this.scrFiles = [];
            }

            if (srcString != undefined) {
                if (typeof(srcString) === "string") {
                    this.srcStrings = [srcString];
                } else {
                    this.srcStrings = srcString;
                }
            } else {
                this.srcStrings = [];
            }
        } else {
            throw Error("Either a source file or a source string needs to be specified.");
        }

    }

    private async evaluateSources(): Promise<void> {
        const numberOfSources: number = this.scrFiles.length + this.srcStrings.length;
        //console.log(`Starting evaluation of ${this.combinedTranslations.length} sources`);
        let numberOfEvaluatedSources: number = this.sourcesCachedFromDB;
        this.translationStrategy.findTargetLanguage(this.combinedTranslations);

        return new Promise((resolve) => {
            if (numberOfEvaluatedSources === numberOfSources) {
                //console.log(`All sources have already benn evaluated.`);
                this._isReadyToTranslate = true;
                resolve();
            } else {
                //console.log("Evaluation is being carried out")
                this.combinedTranslations.forEach((translationObject: TranslationObject) => {
                    //console.log(`Finding matching translation from ${translationObject}`);
                    const key: string = translationObject.key;
                    const availableTranslations: Translation[] = [];

                    (translationObject.values as LanguageValuePair[]).forEach((pair: LanguageValuePair) => {
                        availableTranslations.push(new Translation(key, pair.value, pair.lang));
                    });

                    this.translationStrategy.addTranslation(key, availableTranslations);

                    numberOfEvaluatedSources++;
                    if (numberOfEvaluatedSources === numberOfSources) {
                        this._isReadyToTranslate = true;
                        resolve();
                    }
                });
            }
        });
    }

    public async fetchTranslationsFile(url: string): Promise<TranslationObject[]> {
        return new Promise((resolve, reject) => {
            fetch(
                url,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json"
                    },
                    cache: "default"
                }
            ).then(
                (response: Response) => response.json()
            ).then(
                json => {
                    const translations: TranslationObject[] = (json as TranslationsSource).translations;
                    this.combinedTranslations = this.combinedTranslations.concat(translations);

                    resolve(translations);
                }
            ).catch(reason => {
                reject();
            });
        });
    }

    public async loadSources(rejectWhenError: boolean): Promise<boolean> {
        const numberOfSources: number = this.scrFiles.length + this.srcStrings.length;
        let numberOfLoadedSources: number = 0;

        return new Promise((resolve, reject) => {

            this.scrFiles.forEach((url: string) => {
                if (this.useSavedTranslations) {
                    if (this.database === undefined) {
                        this.database = new Database((success: boolean) => {
                            if (success && this.database != undefined) {
                                (this.database as Database).areTranslationsSaved(url)
                                    .then((entry: FileDatabaseEntry | undefined) => {
                                        if (entry === undefined) {
                                            this.fetchTranslationsFile(url).then((translationObjects: TranslationObject[]) => {
                                                const translations: Translation[] = [];
                                                translationObjects.forEach((translationObject: TranslationObject) => {
                                                    translationObject.values.forEach((langValPair: LanguageValuePair) => {
                                                        translations.push(new Translation(
                                                            translationObject.key,
                                                            langValPair.value,
                                                            langValPair.lang
                                                        ));
                                                    });
                                                });
                                                (this.database as Database).addFileEntry(url).then((fileId: number) => {
                                                    (this.database as Database).saveTranslations(
                                                        fileId,
                                                        translations
                                                    );
                                                });
                                                numberOfLoadedSources++;

                                                if (numberOfLoadedSources === numberOfSources) {
                                                    this.evaluateSources().then(() => {
                                                        this._isReadyToTranslate = true;
                                                        resolve(true);
                                                    });
                                                }
                                            });
                                        } else {
                                            //console.log(`retrieving Translations with fileId = ${entry.id}`);
                                            (this.database as Database).getTranslationsWithFileId(entry.id).then((entries: TranslationDatabaseEntry[]) => {
                                                //console.log(entries);
                                                this.translationStrategy.addTranslationsFromDatabase(entries);
                                                numberOfLoadedSources++;
                                                this.sourcesCachedFromDB++;

                                                if (numberOfLoadedSources === numberOfSources) {
                                                    this.evaluateSources().then(() => {
                                                        this._isReadyToTranslate = true;
                                                        resolve(true);
                                                    });
                                                }
                                            });
                                        }
                                });
                            }
                        });
                    }
                } else {
                    this.fetchTranslationsFile(url).then(() => {
                        numberOfLoadedSources++;

                        if (numberOfLoadedSources === numberOfSources) {
                            this.evaluateSources().then(() => {
                                this._isReadyToTranslate = true;
                                resolve(true);
                            });
                        }
                    }).catch(reason => {
                        numberOfLoadedSources++;
                        if (rejectWhenError) {
                            reject("Source could not be loaded or interpreted.")
                        } else if (numberOfLoadedSources === numberOfSources) {
                            this.evaluateSources().then(() => {
                                this._isReadyToTranslate = true;
                                resolve(true);
                            });
                        }
                    });
                }
            });
            
            this.srcStrings.forEach((srcString: string) => {
                //console.log(`Loading ${srcString}`);
                this.combinedTranslations = this.combinedTranslations.concat((JSON.parse(srcString) as TranslationsSource).translations);

                numberOfLoadedSources++;

                if (numberOfLoadedSources === numberOfSources) {
                    this.evaluateSources().then(() => {
                        resolve(true);
                    });
                }
            });
        });
    }

    public get isReadyToTranslate(): boolean {
        return this._isReadyToTranslate
    }

    public async translateAll(errorText: string | undefined): Promise<boolean> {
        //console.log(`Starting translation`);
        return new Promise((resolve, reject) => {
            if (this.isReadyToTranslate) {
                for (const p of document.querySelectorAll("p, h1, h2, h3, h4, h5, img")) {
                    if (p.hasAttribute(Wolpertinger.ATTRIBUTE_NAME_TRANSLATION)) {
                        const key: string = p.getAttribute(Wolpertinger.ATTRIBUTE_NAME_TRANSLATION) as string;
                        this.translationStrategy.translate(key).then((translation: string) => {
                            //console.log(`Translating ${key} with ${translation}`);
                            p.innerHTML = translation;
                        }).catch(reason => {
                            if (errorText != undefined) {
                                p.innerHTML = errorText;
                            }
                        });
                    } else if (p.hasAttribute(Wolpertinger.ATTRIBUTE_NAME_LOCALIZED_IMAGE)) {
                        const keySrc: string = p.getAttribute(Wolpertinger.ATTRIBUTE_NAME_LOCALIZED_IMAGE) as string;
                        this.translationStrategy.translate(keySrc).then((src: string) => {
                            (p as HTMLImageElement).src = src;
                        });

                        if (p.hasAttribute(Wolpertinger.ATTRIBUTE_NAME_LOCALIZED_ALT)) {
                            const keyAlt: string = p.getAttribute(Wolpertinger.ATTRIBUTE_NAME_LOCALIZED_ALT) as string;
                            this.translationStrategy.translate(keyAlt).then((alt: string) => {
                                (p as HTMLImageElement).alt = alt;
                            });
                        }
                    }
                }

                resolve(true);
            } else {
                reject("Sources have not been evaluated yet.");
            }
        });
    }

}