export class CookieWorker {
    public static COOKIE_NAME_PREFERRED_LANGUAGE: string = "wolpertinger-preferred-language";
    public static async savePreferredLanguage(language: string): Promise<void> {
        return new Promise((resolve, reject) => {
            document.cookie = `${CookieWorker.COOKIE_NAME_PREFERRED_LANGUAGE} = ${language}`;
            if (CookieWorker.savedPreferredLanguage === language) {
                resolve();
            } else {
                reject();
            }
        });
    }

    public static get savedPreferredLanguage(): string | undefined {
        const cookies: string[] = document.cookie.split(";")
        for (const cookie of cookies) {
            const nameAndValue: string[] = cookie.split("=");
            if (nameAndValue.length === 2) {
                if (nameAndValue[0].trim() === CookieWorker.COOKIE_NAME_PREFERRED_LANGUAGE) {
                    return nameAndValue[1].trim();
                }
            }
        }

        return undefined;
    }
}
