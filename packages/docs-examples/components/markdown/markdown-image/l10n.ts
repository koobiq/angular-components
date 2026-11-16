import { Translations } from '@koobiq/docs-examples/i18n';

/** Markdown source of the examples, keyed by example. */
export interface ExampleTranslation {
    image: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        image: `![С подписью](https://koobiq.io/assets/images/markdown/markdown-image.png)
*Подпись*`
    },
    default: {
        image: `![With caption text](https://koobiq.io/assets/images/markdown/markdown-image.png)
*Caption*`
    }
};
