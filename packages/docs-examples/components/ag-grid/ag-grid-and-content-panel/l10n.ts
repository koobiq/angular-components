import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-and-content-panel example. */
export interface ExampleText {
    headerText: string;
    text: (index: number) => string;
    more: string;
    showExample: string;
    closeWindow: string;
    clickRowHint: string;
    selectedRow: (index: number) => string;
    caption: string;
    edit: string;
    copy: string;
    delete: string;
    button: (index: number) => string;
    reportBug: string;
    copyLink: string;
    expand: string;
    dosText: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        headerText: 'Текст',
        text: (index) => `Текст ${index}`,
        more: 'Ещё',
        showExample: 'Показать пример',
        closeWindow: 'Закрыть окно',
        clickRowHint: 'Нажмите на строку таблицы, чтобы открыть панель',
        selectedRow: (index) => `Выбрана строка ${index}`,
        caption: 'Подпись',
        edit: 'Редактировать',
        copy: 'Копировать',
        delete: 'Удалить',
        button: (index) => `Кнопка ${index}`,
        reportBug: 'Сообщить об ошибке',
        copyLink: 'Копировать ссылку',
        expand: 'Развернуть',
        dosText: (index) =>
            `В информатике [${index}] атака отказа в обслуживании (атака DoS) — это кибератака, в которой злоумышленник стремится сделать машину или сетевой ресурс недоступными для предполагаемых пользователей, временно или бессрочно нарушая работу служб узла, подключённого к сети. Отказ в обслуживании обычно достигается флудом целевой машины или ресурса избыточными запросами, чтобы перегрузить системы и не дать выполниться части или всем легитимным запросам. Спектр атак широк — от завала сервера миллионами запросов для замедления его работы до переполнения сервера большим объёмом некорректных данных или отправки запросов с недействительного IP-адреса.`
    },
    default: {
        headerText: 'Text',
        text: (index) => `Text ${index}`,
        more: 'More',
        showExample: 'Show example',
        closeWindow: 'Close window',
        clickRowHint: 'Click any table row to open Content panel',
        selectedRow: (index) => `Selected row ${index}`,
        caption: 'Caption',
        edit: 'Edit',
        copy: 'Copy',
        delete: 'Delete',
        button: (index) => `Button ${index}`,
        reportBug: 'Report a bug',
        copyLink: 'Copy link',
        expand: 'Expand',
        dosText: (index) =>
            `In computing [${index}], a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network. Denial of service is typically accomplished by flooding the targeted machine or resource with superfluous requests in an attempt to overload systems and prevent some or all legitimate requests from being fulfilled. The range of attacks varies widely, spanning from inundating a server with millions of requests to slow its performance, overwhelming a server with a substantial amount of invalid data, to submitting requests with an illegitimate IP address.`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
