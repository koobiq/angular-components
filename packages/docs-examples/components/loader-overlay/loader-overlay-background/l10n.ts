import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the loader-overlay-background example. */
export interface ExampleTranslation {
    backgroundContent: string;
    backgroundContentFade: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        backgroundContent:
            'Содержимое под оверлеем становится едва различимым, будто скрыто в тумане. Интерфейс остаётся узнаваемым, пока идёт загрузка, но основные действия временно недоступны.',
        backgroundContentFade:
            'Оверлей органично сливается с фоном, не оставляя видимой границы по краям. Подбор цвета оверлея под поверхность сохраняет связь контейнера с окружающим интерфейсом.'
    },
    default: {
        backgroundContent:
            'Content behind the overlay becomes barely visible, as if hidden in fog. The interface remains recognizable while loading continues, but the main actions are temporarily unavailable.',
        backgroundContentFade:
            'The overlay blends seamlessly with the background, leaving no visible boundary around its edges. Matching the overlay color to the surface keeps the container connected to the surrounding interface.'
    }
};
