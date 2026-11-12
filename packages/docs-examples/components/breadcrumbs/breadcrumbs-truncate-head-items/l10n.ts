import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the breadcrumbs-truncate-head-items example. */
export interface ExampleTranslation {
    components: string;
    commit: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        components: 'Компоненты',
        commit: 'Коммит'
    },
    default: {
        components: 'Components',
        commit: 'Commit'
    }
};
