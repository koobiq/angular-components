import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the ag-grid examples. */
export interface ExampleText {
    headerText: string;
    text: (index: number) => string;
    link: string;
    linkN: (index: number) => string;
    projectName: string;
    projectNameN: (index: number) => string;
    column: (index: number) => string;
    selected: string;
    more: string;
    responsible: string;
    linkToIncident: string;
    remove: string;
    actionInitiated: (action: string) => string;
    resetColumnState: string;
    resetFilterState: string;
    resetFocusState: string;
    resetSelectionState: string;
    clearCollapsedState: string;
    clearSelectionState: string;
    download: (format: string) => string;
    externalFilter: string;
    quickFilter: string;
    filter: string;
    showLoadingOverlay: string;
    pinnedColumns: string;
    rowDividers: string;
    dtoSentToBackend: string;
    dataCopied: string;
    dataCopiedCaption: (format: string) => string;
    rowCopied: (index: number) => string;
    rowArchived: (index: number) => string;
    expandMultipleRows: string;
    fillExpandedRows: string;
    collapse: string;
    description: string;
    affectedHost: string;
    detectedBy: string;
    event: string;
    severity: string;
    status: string;
    sourceIp: string;
    destinationIp: string;
    protocol: string;
    port: string;
    mitreTechnique: string;
    incidentId: string;
    attackType: string;
    density: string;
    compact: string;
    normal: string;
    group: string;
    category: string;
    totalRows: string;
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
    collapseLink: string;
    moreCount: (count: number) => string;
    allCount: (count: number) => string;
    categories: string[];
    severities: string[];
    statuses: string[];
    attackTypes: string[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        headerText: 'Текст',
        text: (index) => `Текст ${index}`,
        link: 'Ссылка',
        linkN: (index) => `Ссылка ${index}`,
        projectName: 'Название проекта',
        projectNameN: (index) => `Название проекта ${index}`,
        column: (index) => `Колонка ${index}`,
        selected: 'Выбрано:',
        more: 'Ещё',
        responsible: 'Ответственный',
        linkToIncident: 'Ссылка на инцидент',
        remove: 'Удалить',
        actionInitiated: (action) => `Действие ${action} инициировано`,
        resetColumnState: 'Сбросить состояние колонок',
        resetFilterState: 'Сбросить состояние фильтров',
        resetFocusState: 'Сбросить состояние фокуса',
        resetSelectionState: 'Сбросить состояние выбора',
        clearCollapsedState: 'Очистить состояние свёрнутости',
        clearSelectionState: 'Очистить состояние выбора',
        download: (format) => `Скачать ${format}`,
        externalFilter: 'Внешний фильтр',
        quickFilter: 'Быстрый фильтр',
        filter: 'Фильтр',
        showLoadingOverlay: 'Показать оверлей загрузки',
        pinnedColumns: 'Закреплённые колонки',
        rowDividers: 'Разделители строк',
        dtoSentToBackend: 'DTO, отправляемый на бэкенд:',
        dataCopied: 'Данные скопированы',
        dataCopiedCaption: (format) => `Выбранные строки скопированы в буфер обмена. Формат: ${format}`,
        rowCopied: (index) => `Строка №${index} скопирована`,
        rowArchived: (index) => `Строка №${index} заархивирована`,
        expandMultipleRows: 'Раскрывать несколько строк',
        fillExpandedRows: 'Заполнять раскрытые строки',
        collapse: 'Свернуть',
        description: 'Описание',
        affectedHost: 'Затронутый узел',
        detectedBy: 'Обнаружено',
        event: 'Событие',
        severity: 'Важность',
        status: 'Статус',
        sourceIp: 'IP-адрес источника',
        destinationIp: 'IP-адрес назначения',
        protocol: 'Протокол',
        port: 'Порт',
        mitreTechnique: 'Техника MITRE',
        incidentId: 'ID инцидента',
        attackType: 'Тип атаки',
        density: 'Плотность',
        compact: 'Компактно',
        normal: 'Обычно',
        group: 'Группа',
        category: 'Категория',
        totalRows: 'Всего строк:',
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
            `В информатике [${index}] атака отказа в обслуживании (атака DoS) — это кибератака, в которой злоумышленник стремится сделать машину или сетевой ресурс недоступными для предполагаемых пользователей, временно или бессрочно нарушая работу служб узла, подключённого к сети. Отказ в обслуживании обычно достигается флудом целевой машины или ресурса избыточными запросами, чтобы перегрузить системы и не дать выполниться части или всем легитимным запросам. Спектр атак широк — от завала сервера миллионами запросов для замедления его работы до переполнения сервера большим объёмом некорректных данных или отправки запросов с недействительного IP-адреса.`,
        collapseLink: 'Свернуть',
        moreCount: (count) => `${count} еще`,
        allCount: (count) => `Все ${count}`,
        categories: ['Подбор пароля', 'Сложная атака', 'DDoS', 'HIPS-алерт', 'IDS/IPS-алерт', 'XSS'],
        severities: ['Низкая', 'Средняя', 'Высокая', 'Критическая'],
        statuses: ['Новый', 'В работе', 'Решён'],
        attackTypes: ['Подбор пароля', 'Фишинг', 'Сканирование портов', 'Вредоносное ПО', 'DNS-туннелирование']
    },
    default: {
        headerText: 'Text',
        text: (index) => `Text ${index}`,
        link: 'Link',
        linkN: (index) => `Link ${index}`,
        projectName: 'Project name',
        projectNameN: (index) => `Project name ${index}`,
        column: (index) => `Column ${index}`,
        selected: 'Selected:',
        more: 'More',
        responsible: 'Responsible',
        linkToIncident: 'Link to incident',
        remove: 'Remove',
        actionInitiated: (action) => `Action initiated ${action}`,
        resetColumnState: 'Reset column state',
        resetFilterState: 'Reset filter state',
        resetFocusState: 'Reset focus state',
        resetSelectionState: 'Reset selection state',
        clearCollapsedState: 'Clear collapsed state',
        clearSelectionState: 'Clear selection state',
        download: (format) => `Download ${format}`,
        externalFilter: 'External filter',
        quickFilter: 'Quick filter',
        filter: 'Filter',
        showLoadingOverlay: 'Show loading overlay',
        pinnedColumns: 'Pinned columns',
        rowDividers: 'Row dividers',
        dtoSentToBackend: 'DTO sent to the backend:',
        dataCopied: 'Data copied',
        dataCopiedCaption: (format) => `Selected nodes have been copied to clipboard. Format: ${format}`,
        rowCopied: (index) => `Row #${index} copied`,
        rowArchived: (index) => `Row #${index} archived`,
        expandMultipleRows: 'Expand multiple rows',
        fillExpandedRows: 'Fill expanded rows',
        collapse: 'Collapse',
        description: 'Description',
        affectedHost: 'Affected host',
        detectedBy: 'Detected by',
        event: 'Event',
        severity: 'Severity',
        status: 'Status',
        sourceIp: 'Source IP',
        destinationIp: 'Destination IP',
        protocol: 'Protocol',
        port: 'Port',
        mitreTechnique: 'MITRE technique',
        incidentId: 'Incident ID',
        attackType: 'Attack type',
        density: 'Density',
        compact: 'Compact',
        normal: 'Normal',
        group: 'Group',
        category: 'Category',
        totalRows: 'Total rows:',
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
            `In computing [${index}], a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network. Denial of service is typically accomplished by flooding the targeted machine or resource with superfluous requests in an attempt to overload systems and prevent some or all legitimate requests from being fulfilled. The range of attacks varies widely, spanning from inundating a server with millions of requests to slow its performance, overwhelming a server with a substantial amount of invalid data, to submitting requests with an illegitimate IP address.`,
        collapseLink: 'Collapse',
        moreCount: (count) => `${count} more`,
        allCount: (count) => `All ${count}`,
        categories: ['BruteForce', 'Complex Attack', 'DDoS', 'HIPS alert', 'IDS/IPS Alert', 'XSS'],
        severities: ['Low', 'Medium', 'High', 'Critical'],
        statuses: ['New', 'In progress', 'Resolved'],
        attackTypes: ['Brute force', 'Phishing', 'Port scan', 'Malware', 'DNS tunneling']
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
