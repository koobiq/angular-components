import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the title examples. */
export interface ExampleText {
    plainStringContent: string;
    richTemplateContent: string;
    richTooltip: string;
    longValue: string;
    stringContent: string;
    status: string;
    longValueMultiple: string;
    justText: string;
    andLongText: string;
    longMultiline: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        plainStringContent: 'Обычная строка',
        richTemplateContent: 'Шаблон с разметкой',
        richTooltip: 'Тултип с произвольной разметкой',
        longValue: 'Длинный текст, который не помещается в контейнер и обрезается многоточием',
        stringContent: 'Содержимое тултипа в виде обычной строки',
        status: 'Статус',
        longValueMultiple: 'Длинное значение, которое не помещается и обрезается многоточием',
        justText: 'Просто текст',
        andLongText: ' и длинный текст',
        longMultiline:
            'Длинный многострочный текст, ограниченный двумя строками. Когда он не помещается в отведённые строки, директива title показывает тултип с полным содержимым.'
    },
    default: {
        plainStringContent: 'Plain string content',
        richTemplateContent: 'Rich template content',
        richTooltip: 'Rich tooltip with custom markup',
        longValue: 'A long text that does not fit into the container and is truncated with an ellipsis',
        stringContent: 'Tooltip content provided as a plain string',
        status: 'Status',
        longValueMultiple: 'A long value that does not fit and is truncated with an ellipsis',
        justText: 'Just a text',
        andLongText: ' and a long text',
        longMultiline:
            'A long multiline text clamped to two lines. When it does not fit into the allotted lines, the title directive shows a tooltip with the full content.'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
