import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the dropdown examples. */
export interface ExampleText {
    textNormal: string;
    caption: string;
    header: string;
    disabled: string;
    point2: string;
    point3: string;
    link: string;
    toggleDisabledState: string;
    toggleOpenByArrowDown: string;
    someInfo: string;
    value: string;
    dropdownTrigger: string;
    loadingItem: string;
    rulesSettings: string;
    hashSumSettings: string;
    hashSumSettingsUnavailable: string;
    moreActions: string;
    search: string;
    subheaderForActions: string;
    columns: string;
    alignIntent: string;
    borderLines: string;
    bulletsNumbering: string;
    clearFormatting: string;
    headersFooters: string;
    image: string;
    lineSpacing: string;
    pageNumbers: string;
    paragraphStyles: string;
    table: string;
    text: string;
    heading: (level: number) => string;
    normalText: string;
    subtitle: string;
    title: string;
    options: string;
    applyTitle: (title: string) => string;
    updateTitle: (title: string) => string;
    borderAndShading: string;
    searchSettings: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        textNormal: 'Обычный текст',
        caption: 'Подпись',
        header: 'Заголовок',
        disabled: 'Отключено',
        point2: 'Пункт 2',
        point3: 'Пункт 3',
        link: 'Ссылка',
        toggleDisabledState: 'переключить отключённое состояние',
        toggleOpenByArrowDown: 'переключить openByArrowDown',
        someInfo: 'Информация',
        value: 'Значение:',
        dropdownTrigger: 'выпадающий список',
        loadingItem: 'Загрузка пункта',
        rulesSettings: 'Настройки правил',
        hashSumSettings: 'Настройки хеш-суммы',
        hashSumSettingsUnavailable: 'Настройки хеш-суммы (недоступно)',
        moreActions: 'Другие действия',
        search: 'Поиск',
        subheaderForActions: 'Подзаголовок для действий',
        columns: 'Колонки',
        alignIntent: 'Выравнивание и отступы',
        borderLines: 'Границы и линии',
        bulletsNumbering: 'Маркеры и нумерация',
        clearFormatting: 'Очистить форматирование',
        headersFooters: 'Колонтитулы',
        image: 'Изображение',
        lineSpacing: 'Межстрочный интервал',
        pageNumbers: 'Номера страниц',
        paragraphStyles: 'Стили абзаца',
        table: 'Таблица',
        text: 'Текст',
        heading: (level) => `Заголовок ${level}`,
        normalText: 'Обычный текст',
        subtitle: 'Подзаголовок',
        title: 'Название',
        options: 'Параметры',
        applyTitle: (title) => `Применить «${title}»`,
        updateTitle: (title) => `Обновить «${title}» по стилю`,
        borderAndShading: 'Границы и заливка',
        searchSettings: 'Настройки поиска'
    },
    default: {
        textNormal: 'Text Normal',
        caption: 'Caption',
        header: 'Header',
        disabled: 'Disabled',
        point2: 'Point 2',
        point3: 'Point 3',
        link: 'Link',
        toggleDisabledState: 'toggle disabled state',
        toggleOpenByArrowDown: 'toggle openByArrowDown',
        someInfo: 'Some info',
        value: 'Value:',
        dropdownTrigger: 'dropdown',
        loadingItem: 'Loading item',
        rulesSettings: 'Rules settings',
        hashSumSettings: 'Hash sum settings',
        hashSumSettingsUnavailable: 'Hash sum settings (unavailable)',
        moreActions: 'More actions',
        search: 'Search',
        subheaderForActions: 'Subheader for actions',
        columns: 'Columns',
        alignIntent: 'Align & intent',
        borderLines: 'Border & lines',
        bulletsNumbering: 'Bullets & numbering',
        clearFormatting: 'Clear formatting',
        headersFooters: 'Headers & footers',
        image: 'Image',
        lineSpacing: 'Line spacing',
        pageNumbers: 'Page numbers',
        paragraphStyles: 'Paragraph styles',
        table: 'Table',
        text: 'Text',
        heading: (level) => `Heading ${level}`,
        normalText: 'Normal text',
        subtitle: 'Subtitle',
        title: 'Title',
        options: 'Options',
        applyTitle: (title) => `Apply '${title}'`,
        updateTitle: (title) => `Update '${title}' to match style`,
        borderAndShading: 'Border and shading',
        searchSettings: 'Search settings'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
