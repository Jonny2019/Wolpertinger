import {TranslationStrategy, Translation} from "./translation-strategy";

export class Wolpertinger<T extends TranslationStrategy> {
    public readonly scrFiles: string[];
    public readonly srcStrings: string[];
    private readonly translationStrategy: T;
    private _isReadyToTranslate: boolean = false;
    private combinedTranslations: TranslationObject[] = [];

    constructor(
        srcFile: string | string[] | undefined,
        srcString: string | string[] | undefined,
        private readonly _createTranslationStrategy: {new (): T}
    ) {
        this.translationStrategy = new this._createTranslationStrategy();

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
        // console.log(`Starting evaluation of ${this.combinedTranslations.length} sources`);
        let numberOfEvaluatedSources: number = 0;
        this.translationStrategy.findTargetLanguage(this.combinedTranslations);

        return new Promise((resolve) => {
            this.combinedTranslations.forEach((translationObject: TranslationObject) => {
                // console.log(`Finding matching translation from ${translationObject}`);
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
        });
    }

    public async loadSources(rejectWhenError: boolean): Promise<boolean> {
        const numberOfSources: number = this.scrFiles.length + this.srcStrings.length;
        let numberOfLoadedSources: number = 0;

        return new Promise((resolve, reject) => {

            this.scrFiles.forEach((url: string) => {
                //console.log(`Loading ${url} via fetch`);
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
                        //console.log(`Adding ${json} to translations`);
                        this.combinedTranslations = this.combinedTranslations.concat((json as TranslationsSource).translations);
                        numberOfLoadedSources++;

                        if (numberOfLoadedSources === numberOfSources) {
                            this.evaluateSources().then(() => {
                                resolve(true);
                            });
                        }

                    }
                )
                .catch(reason => {
                    numberOfLoadedSources++;
                    if (rejectWhenError) {
                        reject("Source could not be loaded or interpreted.")
                    } else if (numberOfLoadedSources === numberOfSources) {
                        this._isReadyToTranslate = true;
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
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
                for (const p of document.querySelectorAll("p, h1, h2, h3, h4, h5")) {
                    if (p.hasAttribute("data-translation")) {
                        const key: string = p.getAttribute("data-translation") as string;
                        this.translationStrategy.translate(key).then((translation: string) => {
                            //console.log(`Translating ${key} with ${translation}`);
                            p.innerHTML = translation;
                        }).catch(reason => {
                            if (errorText != undefined) {
                                p.innerHTML = errorText;
                            }
                        });
                    }
                }

                resolve(true);
            } else {
                reject("Sources have not been evaluated yet.");
            }
        });
    }

}