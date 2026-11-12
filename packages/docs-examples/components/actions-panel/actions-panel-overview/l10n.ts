import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the actions panel examples. */
export interface ExampleText {
    open: string;
    action1: string;
    action2: string;
    action3: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        open: 'открыть',
        action1: 'Действие 1',
        action2: 'Действие 2',
        action3: 'Действие 3'
    },
    default: {
        open: 'open',
        action1: 'Action 1',
        action2: 'Action 2',
        action3: 'Action 3'
    }
};
