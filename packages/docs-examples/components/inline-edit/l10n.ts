import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the inline-edit examples. Person names, role ids and permission ids stay as-is. */
export interface ExampleText {
    placeholder: string;
    empty: string;
    country: string;
    capital: string;
    currency: string;
    label: string;
    textField: string;
    textarea: string;
    selectMultiple: string;
    select: string;
    link: string;
    style: string;
    founded: string;
    name: string;
    description: string;
    roles: string;
    assignee: string;
    status: string;
    resolutionComment: string;
    notEmpty: string;
    ipAddress: string;
    statuses: string[];
    severities: string[];
    priority: string;
    notSpecified: string;
    optionN: (index: number) => string;
    edit: string;
    retry: string;
    discardChanges: string;
    close: string;
    couldntUpdate: string;
    errorMessage: string;
    invalidIpRfc: string;
    saveErrorIntro1: string;
    saveErrorIntro2: string;
    invalidItemsIntro1: string;
    invalidItemsIntro2: string;
    theseRolesNotAvailable: (roles: string) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        empty: 'Пусто',
        country: 'Страна',
        capital: 'Столица',
        currency: 'Валюта',
        label: 'Метка',
        textField: 'Текстовое поле',
        textarea: 'Текстовая область',
        selectMultiple: 'Множественный выбор',
        select: 'Список',
        link: 'Ссылка',
        style: 'Стиль',
        founded: 'Основана',
        name: 'Имя',
        description: 'Описание',
        roles: 'Роли',
        assignee: 'Исполнитель',
        status: 'Статус',
        resolutionComment: 'Комментарий к решению',
        notEmpty: 'Не пусто',
        ipAddress: 'IP-адрес',
        statuses: ['Открыт', 'В работе', 'Решён', 'Закрыт'],
        severities: ['Критическая', 'Высокая', 'Средняя', 'Низкая'],
        priority: 'Приоритет',
        notSpecified: 'Не указано',
        optionN: (index) => `Вариант №${index}`,
        edit: 'Редактировать',
        retry: 'Повторить',
        discardChanges: 'Отменить изменения',
        close: 'Закрыть',
        couldntUpdate: 'Не удалось обновить поле',
        errorMessage: 'Сообщение об ошибке',
        invalidIpRfc: 'Некорректный IP: не соответствует RFC',
        saveErrorIntro1: 'Сохраните',
        saveErrorIntro2:
            'как имя, чтобы значение было отклонено. Сохранение описания падает с первой попытки и успешно со второй.',
        invalidItemsIntro1: 'Добавьте',
        invalidItemsIntro2: 'в роли, чтобы сервер их отклонил.',
        theseRolesNotAvailable: (roles) => `Эти роли недоступны: ${roles}`
    },
    default: {
        placeholder: 'Placeholder',
        empty: 'Empty',
        country: 'Country',
        capital: 'Capital',
        currency: 'Currency',
        label: 'Label',
        textField: 'Text Field',
        textarea: 'Textarea',
        selectMultiple: 'Select Multiple',
        select: 'Select',
        link: 'Link',
        style: 'Style',
        founded: 'Founded',
        name: 'Name',
        description: 'Description',
        roles: 'Roles',
        assignee: 'Assignee',
        status: 'Status',
        resolutionComment: 'Resolution comment',
        notEmpty: 'Not empty',
        ipAddress: 'IP-address',
        statuses: ['Open', 'In progress', 'Resolved', 'Closed'],
        severities: ['Critical', 'High', 'Medium', 'Low'],
        priority: 'Priority',
        notSpecified: 'Not specified',
        optionN: (index) => `Option #${index}`,
        edit: 'Edit',
        retry: 'Retry',
        discardChanges: 'Discard changes',
        close: 'Close',
        couldntUpdate: 'Couldn’t update the field',
        errorMessage: 'Error message',
        invalidIpRfc: 'Invalid IP: RFC non-compliant',
        saveErrorIntro1: 'Save',
        saveErrorIntro2:
            'as the name to have the value rejected. Saving the description fails on the first attempt and succeeds on retry.',
        invalidItemsIntro1: 'Add',
        invalidItemsIntro2: 'to the roles to have the server reject them.',
        theseRolesNotAvailable: (roles) => `These roles are not available: ${roles}`
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
