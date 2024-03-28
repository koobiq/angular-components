

export const enUSLocaleData = {
    'en-US': {
        select: { hiddenItemsText: 'one more' },
        datepicker: {
            placeholder: 'yyyy-mm-dd',
            dateInput: 'yyyy-MM-dd'
        },
        formatters: {
            number: {
                rounding: {
                    separator: '',
                    groupSeparator: '.',
                    thousand: 'K',
                    million: 'M',
                    billion: 'B',
                    trillion: 'T'
                }
            }
        },
        input: {
            number: {
                groupSeparator: [','],
                fractionSeparator: '.'
            }
        }
    }
};
