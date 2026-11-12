import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the popover-relative-to-pointer example. */
export interface ExampleText {
    informationAbout: (owner: string) => string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        informationAbout: (owner) => `Информация о ${owner}.`
    },
    default: {
        informationAbout: (owner) => `Information about ${owner}.`
    }
};
