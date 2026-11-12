import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the skeleton-in-sidepanel example. */
export interface ExampleText {
    openSidepanel: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        openSidepanel: 'Открыть панель'
    },
    default: {
        openSidepanel: 'Open sidepanel'
    }
};
