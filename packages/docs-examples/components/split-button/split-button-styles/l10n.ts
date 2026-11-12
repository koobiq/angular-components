import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the split-button examples. Style names (Filled Contrast) stay English as API names. */
export interface ExampleText {
    splitButton: string;
    moreOptions: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        splitButton: 'Кнопка с меню',
        moreOptions: 'Другие параметры'
    },
    default: {
        splitButton: 'Split Button',
        moreOptions: 'More options'
    }
};
