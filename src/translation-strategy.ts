export interface TranslationsArray {
    [key: string]: string;
}

interface OccurrenceCounter {
    [key: string]: number;
}

export class Translation {
    constructor(
        public readonly key: string,
        public readonly text: string,
        public readonly language: string
    ) {}

    public matchesKey(key: string): boolean {
        return this.key === key;
    }

}

export abstract class TranslationStrategy {
    protected acceptedLanguages: string[];
    protected preferredLanguage: string;
    protected evaluatedTranslations: Translation[] = [];
    protected targetLanguage: string | undefined;

    constructor() {
        this.acceptedLanguages = this.allUniqueAcceptedLanguages()
        this.preferredLanguage = navigator.language.substring(0, 2);
    }

    protected allUniqueAcceptedLanguages(): string[] {
        return (navigator.languages as string[])
            .map((value: string) => value.substring(0,2))
            .filter((value: string, index: number, array: string[]) => array.indexOf(value) === index);
    }

    public addTranslation(key: string, options: Translation[]) {
        this.evaluatedTranslations.push(this.applyStrategy(key, options));
    }

    abstract applyStrategy(key: string, options: Translation[]): Translation;

    abstract findTargetLanguage(translations: TranslationObject[]): void;

    public addTranslationsFromDatabase(translations: TranslationDatabaseEntry[]): void {
        while (translations.length != 0) {
            const targetKey: string = translations[0].key;
            const translationsForKey: Translation[] = translations.filter(
                (value: TranslationDatabaseEntry) => value.key === targetKey
            ).map(
                (value: TranslationDatabaseEntry) => new Translation(targetKey, value.translation, value.language)
            );

            this.evaluatedTranslations.push(this.applyStrategy(targetKey, translationsForKey));
            translations = translations.filter(
                (value: TranslationDatabaseEntry) => value.key != targetKey
            )
        }
    }

    public async translate(key: string): Promise<string> {
        return new Promise((resolve, reject) => {
            for (const translation of this.evaluatedTranslations) {
                if (translation.matchesKey(key)) {
                    resolve(translation.text);
                    break;
                }
            }

            reject("Not found");
        });
    }
}

export class AllSameLanguage extends TranslationStrategy {

    override applyStrategy(key: string, options: Translation[]): Translation {
        for (const option of options) {
            if (option.language === this.targetLanguage) {
                return option;
            }
        }

        throw Error("Failed to follow language requirement.");
    }

    override findTargetLanguage(translations: TranslationObject[]) {
        const occurrenceCounter: OccurrenceCounter = {};
        const possibleLanguages: string[] = [];

        translations.forEach((translation: TranslationObject) => {
            translation.values.forEach((value: LanguageValuePair) => {
                if (occurrenceCounter[value.lang] === undefined) {
                    occurrenceCounter[value.lang] = 1;
                    possibleLanguages.push(value.lang);
                } else {
                    occurrenceCounter[value.lang] = occurrenceCounter[value.lang] + 1;
                }
            });
        });

        possibleLanguages.forEach((lang: string, index: number) => {
            if (occurrenceCounter[lang] != translations.length) {
                possibleLanguages.splice(index, 1);
            }
        });

        if (possibleLanguages.length === 0) {
            throw Error("No language found that is supported for all translations.");
        } else if (possibleLanguages.length === 1) {
            this.targetLanguage = possibleLanguages[0];
        } else if (possibleLanguages.indexOf(this.preferredLanguage) != -1) {
            this.targetLanguage = this.preferredLanguage;
        } else {
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

}

export class BestMatch extends TranslationStrategy {
    override applyStrategy(key: string, options: Translation[]): Translation {
        if (options.length === 0) {
            throw Error("No translation options were given.");
        }
        let currentBest: Translation | undefined;
        let bestLangIndex: number = -1;

        options.forEach((option: Translation) => {
            if (option.language === this.preferredLanguage) {
                currentBest = option;
                bestLangIndex = 0;
            } else {
                const langIndex: number = this.acceptedLanguages.indexOf(option.language);
                if (currentBest === undefined) {
                    currentBest = option;
                    bestLangIndex = langIndex
                } else {
                    if (langIndex != -1 && langIndex < bestLangIndex) {
                        currentBest = option;
                        bestLangIndex = langIndex;
                    }
                }
            }
        });

        if (currentBest === undefined) {
            throw Error("Failed to find matching translation.");
        } else {
            //console.log(currentBest);
            return currentBest;
        }
    }

    override findTargetLanguage(translations: TranslationObject[]) {
    }

}
