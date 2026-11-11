import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the split-button-text-overflow example. */
export interface ExampleText {
    moreOptions: string;
    saveEngineering: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        moreOptions: 'Другие параметры',
        saveEngineering:
            'Экономьте время инженеров с единой платёжной функциональностью. Мы берём на себя лабиринт шлюзов, платёжных каналов и финансовых институтов, составляющих мировой экономический ландшафт, чтобы ваши команды могли создавать нужное на одной платформе.'
    },
    default: {
        moreOptions: 'More options',
        saveEngineering:
            'Save engineering time with unified payments functionality. We obsess over the maze of gateways, payments rails, and financial institutions that make up the global economic landscape so that your teams can build what you need on one platform.'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
