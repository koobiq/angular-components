import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Markdown source of the examples, keyed by example. */
export interface ExampleText {
    image: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        image: `![С подписью](https://koobiq.io/assets/images/markdown/markdown-image.png)
*Подпись*`
    },
    default: {
        image: `![With caption text](https://koobiq.io/assets/images/markdown/markdown-image.png)
*Caption*`
    }
};
