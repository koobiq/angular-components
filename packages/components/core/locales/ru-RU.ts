import { KbqCodeBlockLocaleConfiguration } from './types';

export const ruRULocaleData = {
    select: { hiddenItemsText: 'еще {{ number }}' },
    datepicker: {
        placeholder: 'дд.мм.гггг',
        dateInput: 'dd.MM.yyyy'
    },
    timepicker: {
        placeholder: {
            full: 'чч:мм:сс',
            short: 'чч:мм'
        }
    },
    fileUpload: {
        single: {
            captionText: 'Перетащите файл или {{ browseLink }}',
            browseLink: 'выберите'
        },
        multiple: {
            captionText: 'Перетащите сюда или {{ browseLink }}',
            captionTextWhenSelected: 'Перетащите еще или {{ browseLink }}',
            captionTextForCompactSize: 'Перетащите файлы или {{ browseLink }}',
            browseLink: 'выберите',
            title: 'Загрузите файлы',
            gridHeaders: {
                file: 'Файл',
                size: 'Размер'
            }
        }
    },
    codeBlock: {
        softWrapOnTooltip: 'Включить перенос по словам',
        softWrapOffTooltip: 'Выключить перенос по словам',
        downloadTooltip: 'Скачать',
        copiedTooltip: '✓ Скопировано',
        copyTooltip: 'Скопировать',
        viewAllText: 'Показать все',
        viewLessText: 'Свернуть',
        openExternalSystemTooltip: 'Открыть во внешней системе'
    } satisfies KbqCodeBlockLocaleConfiguration,
    timezone: {
        searchPlaceholder: 'Город или часовой пояс'
    }
};
