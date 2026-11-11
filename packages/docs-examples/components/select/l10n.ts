import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the select examples. Account names, network addresses and durations stay as-is. */
export interface ExampleText {
    placeholder: string;
    nothingFound: string;
    loading: string;
    loadFailedRecords: string;
    tryAgain: string;
    failedToLoadLocations: string;
    optionN: (index: number) => string;
    groupN: (index: number) => string;
    loginAccount: string;
    privilegeEscalationAccount: string;
    scrollDown: string;
    scrollUp: string;
    kept: string;
    cleared: string;
    forSelect: string;
    forOptions: string;
    forOptgroup: string;
    button: string;
    caption: string;
    link: string;
    customErrorState: string;
    defaultStrings: string;
    overriddenInstance: string;
    emptySelect: string;
    invalid: string;
    none: string;
    severities: string[];
    twoLong1: string;
    twoLong2: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        nothingFound: 'Ничего не найдено',
        loading: 'Загрузка',
        loadFailedRecords: 'Не удалось показать записи',
        tryAgain: 'Повторить',
        failedToLoadLocations: 'Не удалось загрузить список локаций',
        optionN: (index) => `Вариант №${index}`,
        groupN: (index) => `Группа №${index}`,
        loginAccount: 'Учётная запись',
        privilegeEscalationAccount: 'Учётная запись для повышения привилегий',
        scrollDown: 'Прокрутите вниз',
        scrollUp: 'Прокрутите вверх',
        kept: 'Сохранено',
        cleared: 'Очищено',
        forSelect: 'Для селекта',
        forOptions: 'Для опций',
        forOptgroup: 'Для группы',
        button: 'Кнопка',
        caption: 'Подпись',
        link: 'Ссылка',
        customErrorState: 'Пользовательское состояние ошибки',
        defaultStrings: 'Строки по умолчанию',
        overriddenInstance: 'Переопределено только для этого экземпляра',
        emptySelect: 'Пустой селект',
        invalid: 'Невалидный',
        none: 'Нет',
        severities: ['Критическая', 'Значительная', 'Незначительная', 'Информация'],
        twoLong1: 'Вариант №2 с очень длинной подписью, которая не помещается в одну строку панели',
        twoLong2:
            'Вариант №4 с ещё одной довольно длинной подписью, которая тоже должна переноситься на следующую строку'
    },
    default: {
        placeholder: 'Placeholder',
        nothingFound: 'Nothing found',
        loading: 'Loading',
        loadFailedRecords: 'Failed to load records',
        tryAgain: 'Try Again',
        failedToLoadLocations: 'Failed to load the location list',
        optionN: (index) => `Option #${index}`,
        groupN: (index) => `Group #${index}`,
        loginAccount: 'Login account',
        privilegeEscalationAccount: 'Account for privilege escalation',
        scrollDown: 'Scroll down',
        scrollUp: 'Scroll up',
        kept: 'Kept',
        cleared: 'Cleared',
        forSelect: 'For select',
        forOptions: 'For options',
        forOptgroup: 'For optgroup',
        button: 'Button',
        caption: 'Caption',
        link: 'Link',
        customErrorState: 'Custom Error State',
        defaultStrings: 'Default strings',
        overriddenInstance: 'Overridden for this instance only',
        emptySelect: 'Empty select',
        invalid: 'Invalid',
        none: 'None',
        severities: ['Critical', 'Major', 'Minor', 'Info'],
        twoLong1: 'Option #2 with a very long label that does not fit on a single line of the panel',
        twoLong2: 'Option #4 with another quite long label that also has to wrap onto the next line'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
