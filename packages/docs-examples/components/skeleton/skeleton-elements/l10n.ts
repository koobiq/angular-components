import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the skeleton-elements example. */
export interface ExampleText {
    loading: string;
    start: string;
    active: string;
    history: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        loading: 'Загрузка',
        start: 'Запустить',
        active: 'Активен',
        history: 'История'
    },
    default: {
        loading: 'Loading',
        start: 'Start',
        active: 'Active',
        history: 'History'
    }
};
