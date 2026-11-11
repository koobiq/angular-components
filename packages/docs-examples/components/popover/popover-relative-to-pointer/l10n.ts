import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the popover-relative-to-pointer example. */
export interface ExampleText {
    informationAbout: (owner: string) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        informationAbout: (owner) => `Информация о ${owner}.`
    },
    default: {
        informationAbout: (owner) => `Information about ${owner}.`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
