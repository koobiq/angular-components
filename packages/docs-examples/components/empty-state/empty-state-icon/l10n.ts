import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the empty-state-icon example. */
export interface ExampleText {
    iconText: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        iconText: 'Здесь должны быть описаны действия, которые вы можете выполнить на этом экране, а также их польза.'
    },
    default: {
        iconText: 'This should detail the actions you can take on this screen, as well as why it’s valuable.'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
