import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the dynamic translation examples. */
export interface ExampleText {
    registered: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        registered: 'Зарегистрировано инцидентов: [[bold:1000]].'
    },
    default: {
        registered: '[[bold:1000]] incidents have been registered.'
    }
};
