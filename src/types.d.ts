type TranslationsSource = {
    translations: TranslationObject[]
};

type TranslationObject = {
    key: string,
    values: LanguageValuePair[]
};

type LanguageValuePair = {
    lang: string,
    value: string
};

type TranslationDatabaseEntryPrototype = {
    fileId: number,
    key: string,
    language: string,
    translation: string
}

type TranslationDatabaseEntry = {
    id: number,
    fileId: number,
    key: string,
    language: string,
    translation: string
}

type FileDatabaseEntryPrototype = {
    url: string,
    timestamp: number
}

type FileDatabaseEntry = {
    id: number,
    url: string,
    timestamp: number
}
