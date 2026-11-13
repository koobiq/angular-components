import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the title examples. */
export interface ExampleTranslation {
    plainStringContent: string;
    richTemplateContent: string;
    richTooltip: string;
    longValue: string;
    stringContent: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        plainStringContent: 'Обычная строка',
        richTemplateContent: 'Шаблон с разметкой',
        richTooltip: 'Тултип с произвольной разметкой',
        longValue: 'Длинный текст, который не помещается в контейнер и обрезается многоточием',
        stringContent: 'Содержимое тултипа в виде обычной строки'
    },
    default: {
        plainStringContent: 'Plain string content',
        richTemplateContent: 'Rich template content',
        richTooltip: 'Rich tooltip with custom markup',
        longValue: 'A long text that does not fit into the container and is truncated with an ellipsis',
        stringContent: 'Tooltip content provided as a plain string'
    }
};
