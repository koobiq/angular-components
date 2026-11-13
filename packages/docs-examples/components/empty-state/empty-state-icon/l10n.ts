import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the empty-state-icon example. */
export interface ExampleTranslation {
    iconText: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        iconText: 'Здесь должны быть описаны действия, которые вы можете выполнить на этом экране, а также их польза.'
    },
    default: {
        iconText: 'This should detail the actions you can take on this screen, as well as why it’s valuable.'
    }
};
