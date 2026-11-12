import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the breadcrumbs-truncate-head-items example. */
export interface ExampleText {
    components: string;
    commit: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        components: 'Компоненты',
        commit: 'Коммит'
    },
    default: {
        components: 'Components',
        commit: 'Commit'
    }
};
