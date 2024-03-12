export declare class CookieWorker {
    static COOKIE_NAME_PREFERRED_LANGUAGE: string;
    static savePreferredLanguage(language: string): Promise<void>;
    static get savedPreferredLanguage(): string | undefined;
}
