import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the split-button-text-overflow example. */
export interface ExampleTranslation {
    moreOptions: string;
    saveEngineering: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
