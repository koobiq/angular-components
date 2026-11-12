import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Markdown source of the examples, keyed by example. */
export interface ExampleText {
    list: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        list: `### Нумерованный список:

1. Первый пункт
2. Второй пункт
3. Третий пункт
4. Четвёртый пункт

### Маркированный список:

- Первый пункт
- Второй пункт
- Третий пункт
- Четвёртый пункт`
    },
    default: {
        list: `### Ordered List:

1. First item
2. Second item
3. Third item
4. Fourth item

### Unordered List:

- First item
- Second item
- Third item
- Fourth item`
    }
};
