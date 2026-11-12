import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the empty-state-icon example. */
export interface ExampleText {
    iconText: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        iconText: 'Здесь должны быть описаны действия, которые вы можете выполнить на этом экране, а также их польза.'
    },
    default: {
        iconText: 'This should detail the actions you can take on this screen, as well as why it’s valuable.'
    }
};
