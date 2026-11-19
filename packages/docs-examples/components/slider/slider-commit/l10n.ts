import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    locale: string;
    zoom: string;
    tiles: string;
    overview: string;
    streets: string;
    blocks: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        locale: 'ru-RU',
        zoom: 'Масштаб карты',
        tiles: 'Масштаб загруженных тайлов',
        overview: 'Обзор города',
        streets: 'Улицы',
        blocks: 'Кварталы'
    },
    'en-US': {
        locale: 'en-US',
        zoom: 'Map zoom',
        tiles: 'Loaded tile scale',
        overview: 'City overview',
        streets: 'Streets',
        blocks: 'Blocks'
    }
};
