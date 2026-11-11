import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the breadcrumbs-truncate-head-items example. */
export interface ExampleText {
    components: string;
    commit: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        components: 'Компоненты',
        commit: 'Коммит'
    },
    default: {
        components: 'Components',
        commit: 'Commit'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
