

export const ruRULocaleData = {
    'ru-RU': {
        select: { hiddenItemsText: 'еще'},
        datepicker: {
            placeholder: 'дд.мм.гггг',
            dateInput: 'dd.MM.yyyy'
        },
        formatters: {
            number: {
                rounding: {
                    separator: ' ',
                    groupSeparator: ',',
                    thousand: 'К',
                    million: 'М',
                    billion: 'М',
                    trillion: 'Т'
                }
            }
        },
        input: {
            number: {
                // nbsp is generated automatically and used by default in spec
                // tslint:disable-next-line:no-irregular-whitespace
                groupSeparator: [' ', ' '],
                fractionSeparator: ',',
                startFormattingFrom: 4
            }
        }
    }
};
