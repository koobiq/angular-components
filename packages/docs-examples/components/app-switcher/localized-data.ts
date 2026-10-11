import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the app switcher examples. Product names, captions such as `Byte 001` and app types stay as is. */
export interface ExampleText {
    /** Name and tooltip of the trigger. */
    allApps: string;
    /** Caption of the selected application. */
    app: string;
    /** Caption of the selected site. */
    site: string;
    /** Badge of the main site. */
    mainSite: string;
    sites: {
        northwest: string;
        south: string;
        southernSovereign: string;
        volga: string;
        urals: string;
        siberia: string;
        farEast: string;
    };
    appInstance: (index: number) => string;
    instanceAliasOne: string;
    instanceAliasThree: string;
    instanceAliasFour: string;
}

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> =>
    injectLocalizedText<ExampleText>({
        'ru-RU': {
            allApps: 'Все приложения',
            app: 'Приложение:',
            site: 'Площадка:',
            mainSite: 'Главная',
            sites: {
                northwest: 'СЗФО',
                south: 'ЮФО',
                southernSovereign: 'Южный Суверенный Федеральный Округ ФО',
                volga: 'ПФО',
                urals: 'УФО',
                siberia: 'СФО',
                farEast: 'ДФО'
            },
            appInstance: (index) => `Экземпляр приложения ${index}`,
            instanceAliasOne: 'Алиас экземпляра 1',
            instanceAliasThree: 'Алиас экземпляра 3',
            instanceAliasFour: 'Алиас экземпляра 4'
        },
        default: {
            allApps: 'All apps',
            app: 'App:',
            site: 'Site:',
            mainSite: 'Main',
            sites: {
                northwest: 'Northwest',
                south: 'South',
                southernSovereign: 'Southern Sovereign Federal District',
                volga: 'Volga',
                urals: 'Urals',
                siberia: 'Siberia',
                farEast: 'Far East'
            },
            appInstance: (index) => `App Instance ${index}`,
            instanceAliasOne: 'Instance Alias One',
            instanceAliasThree: 'Instance Alias Three',
            instanceAliasFour: 'Instance Alias Four'
        }
    });
