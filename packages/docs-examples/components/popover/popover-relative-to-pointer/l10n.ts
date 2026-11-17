import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the popover-relative-to-pointer example. */
export interface ExampleTranslation {
    informationAbout: (owner: string) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        informationAbout: (owner) => `Информация о ${owner}.`
    },
    default: {
        informationAbout: (owner) => `Information about ${owner}.`
    }
};
