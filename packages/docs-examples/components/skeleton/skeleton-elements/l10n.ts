import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the skeleton-elements example. */
export interface ExampleTranslation {
    loading: string;
    start: string;
    active: string;
    history: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
