import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-and-content-panel example. */
export interface ExampleText {
    headerText: string;
    more: string;
    showExample: string;
    closeWindow: string;
    clickRowHint: string;
    selectedRow: (index: number) => string;
    caption: string;
    edit: string;
    copy: string;
    delete: string;
    reportBug: string;
    copyLink: string;
    expand: string;
    dosText: (index: number) => string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        headerText: 'Текст',
        more: 'Ещё',
        showExample: 'Показать пример',
        closeWindow: 'Закрыть окно',
        clickRowHint: 'Нажмите на строку таблицы, чтобы открыть панель',
        selectedRow: (index) => `Выбрана строка ${index}`,
        caption: 'Подпись',
        edit: 'Редактировать',
        copy: 'Копировать',
        delete: 'Удалить',
        reportBug: 'Сообщить об ошибке',
        copyLink: 'Копировать ссылку',
        expand: 'Развернуть',
        dosText: (index) =>
            `В информатике [${index}] атака отказа в обслуживании (атака DoS) — это кибератака, в которой злоумышленник стремится сделать машину или сетевой ресурс недоступными для предполагаемых пользователей, временно или бессрочно нарушая работу служб узла, подключённого к сети. Отказ в обслуживании обычно достигается флудом целевой машины или ресурса избыточными запросами, чтобы перегрузить системы и не дать выполниться части или всем легитимным запросам. Спектр атак широк — от завала сервера миллионами запросов для замедления его работы до переполнения сервера большим объёмом некорректных данных или отправки запросов с недействительного IP-адреса.`
    },
    default: {
        headerText: 'Text',
        more: 'More',
        showExample: 'Show example',
        closeWindow: 'Close window',
        clickRowHint: 'Click any table row to open Content panel',
        selectedRow: (index) => `Selected row ${index}`,
        caption: 'Caption',
        edit: 'Edit',
        copy: 'Copy',
        delete: 'Delete',
        reportBug: 'Report a bug',
        copyLink: 'Copy link',
        expand: 'Expand',
        dosText: (index) =>
            `In computing [${index}], a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network. Denial of service is typically accomplished by flooding the targeted machine or resource with superfluous requests in an attempt to overload systems and prevent some or all legitimate requests from being fulfilled. The range of attacks varies widely, spanning from inundating a server with millions of requests to slow its performance, overwhelming a server with a substantial amount of invalid data, to submitting requests with an illegitimate IP address.`
    }
};
