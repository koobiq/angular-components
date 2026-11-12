import { Translations } from '@koobiq/docs-examples/i18n';

/** Markdown source of the examples, keyed by example. */
export interface ExampleTranslation {
    link: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        link: `[Ссылка](#)

[Атака \`brute-force\`](#) — это криптоаналитическая атака, которая теоретически может быть использована для попытки расшифровать любые зашифрованные данные (кроме данных, зашифрованных абсолютно стойким способом).`
    },
    default: {
        link: `[Link](#)

A [\`brute-force\` attack](#) is a cryptanalytic attack that can, in theory, be used to attempt to decrypt any encrypted data (except for data encrypted in an information-theoretically secure manner).`
    }
};
