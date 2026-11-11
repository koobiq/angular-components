import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the modal examples. */
export interface ExampleText {
    openConfirmModal: string;
    openSuccessModal: string;
    openDeleteModal: string;
    saveChangesAria: string;
    saveChangesContent: string;
    save: string;
    cancel: string;
    changesSaved: string;
    allChangesSaved: string;
    deleteCustomer: string;
    deleteCustomerContent: string;
    delete: string;
    stringCaption: string;
    templateCaption: string;
    templateWord: string;
    dialogTitle: string;
    longDialogTitle: string;
    dosTitle: string;
    dosText: string;
    dropdownTrigger: string;
    close: string;
    openModal: string;
    fullyCustomModal: string;
    additionalContext: string;
    itemN: (index: number) => string;
    openTwoModals: string;
    title: string;
    subtitle: string;
    openNextModal: string;
    moreOptions: string;
    openSmallModal: string;
    openMediumModal: string;
    openLargeModal: string;
    textNormal: string;
    caption: string;
    header: string;
    disabled: string;
    point2: string;
    point3: string;
    link: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        openConfirmModal: 'Открыть Confirm-модалку',
        openSuccessModal: 'Открыть Success-модалку',
        openDeleteModal: 'Открыть Delete-модалку',
        saveChangesAria: 'Сохранить изменения',
        saveChangesContent: 'Сохранить изменения?',
        save: 'Сохранить',
        cancel: 'Отмена',
        changesSaved: 'Изменения сохранены',
        allChangesSaved: 'Все изменения сохранены!',
        deleteCustomer: 'Удалить клиента',
        deleteCustomerContent:
            'Задачи, политики и теги, связанные с клиентом, также будут удалены. Удалить выбранного клиента?',
        delete: 'Удалить',
        stringCaption: 'Строковая подпись',
        templateCaption: 'Шаблонная подпись',
        templateWord: 'шаблон',
        dialogTitle: 'Заголовок диалога',
        longDialogTitle:
            'Заголовок диалога Заголовок диалога Заголовок диалога Заголовок диалога го диалога Заголовок ди го диалога Заголовок ди',
        dosTitle: 'Атака DoS',
        dosText:
            'В информатике атака отказа в обслуживании (атака DoS) — это кибератака, в которой злоумышленник стремится сделать машину или сетевой ресурс недоступными для предполагаемых пользователей, временно или бессрочно нарушая работу служб узла, подключённого к сети.',
        dropdownTrigger: 'выпадающий список',
        close: 'Закрыть',
        openModal: 'Открыть модалку',
        fullyCustomModal: 'Полностью кастомная модалка',
        additionalContext: 'Дополнительный контекст или описание диалога',
        itemN: (index) => `Пункт №${index}`,
        openTwoModals: 'Открыть две модалки',
        title: 'заголовок',
        subtitle: 'подзаголовок',
        openNextModal: 'Открыть следующую модалку',
        moreOptions: 'Другие параметры',
        openSmallModal: 'Открыть малую модалку',
        openMediumModal: 'Открыть среднюю модалку',
        openLargeModal: 'Открыть большую модалку',
        textNormal: 'Обычный текст',
        caption: 'Подпись',
        header: 'Заголовок',
        disabled: 'Отключено',
        point2: 'Пункт 2',
        point3: 'Пункт 3',
        link: 'Ссылка'
    },
    default: {
        openConfirmModal: 'Open Confirm Modal',
        openSuccessModal: 'Open Success Modal',
        openDeleteModal: 'Open Delete Modal',
        saveChangesAria: 'Save changes',
        saveChangesContent: 'Save changes?',
        save: 'Save',
        cancel: 'Cancel',
        changesSaved: 'Changes saved',
        allChangesSaved: 'All changes are saved!',
        deleteCustomer: 'Delete customer',
        deleteCustomerContent:
            'The tasks, policies and tags associated with the customer will be deleted too. Delete selected customer?',
        delete: 'Delete',
        stringCaption: 'String caption',
        templateCaption: 'Template caption',
        templateWord: 'template',
        dialogTitle: 'Dialog title',
        longDialogTitle: 'Dialog title Dialog title Dialog title Dialog title g title Dialog titl g title Dialog titl',
        dosTitle: 'DoS attack',
        dosText:
            'In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network.',
        dropdownTrigger: 'dropdown',
        close: 'Close',
        openModal: 'Open Modal',
        fullyCustomModal: 'Fully custom modal',
        additionalContext: 'Additional context or description for the dialog',
        itemN: (index) => `Item #${index}`,
        openTwoModals: 'Open two modals',
        title: 'title',
        subtitle: 'subtitle',
        openNextModal: 'Open next modal',
        moreOptions: 'More options',
        openSmallModal: 'Open small modal',
        openMediumModal: 'Open medium modal',
        openLargeModal: 'Open large modal',
        textNormal: 'Text Normal',
        caption: 'Caption',
        header: 'Header',
        disabled: 'Disabled',
        point2: 'Point 2',
        point3: 'Point 3',
        link: 'Link'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
