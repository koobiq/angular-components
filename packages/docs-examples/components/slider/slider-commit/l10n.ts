import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    zoom: string;
    tiles: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        zoom: 'Масштаб карты',
        tiles: 'Масштаб загруженных тайлов'
    },
    'en-US': {
        zoom: 'Map zoom',
        tiles: 'Loaded tile scale'
    }
};
