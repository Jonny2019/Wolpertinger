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
