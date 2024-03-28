

export const esLALocaleData = {
    'es-LA': {
        select: { hiddenItemsText: 'más'},
        datepicker: {
            placeholder: 'dd/mm/aaaa'
        },
        timepicker: {
            placeholder: {
                full: 'hh:mm:ss',
                short: 'hh:mm'
            }
        },
        formatters: {
            number: {
                rounding: {
                    separator: '',
                    groupSeparator: ',',
                    thousand: 'K',
                    million: 'M',
                    billion: 'MRD',
                    trillion: 'B'
                }
            }
        },
        input: {
            number: {
                // nbsp is generated automatically and used by default in spec
                // tslint:disable-next-line:no-irregular-whitespace
                groupSeparator: [' ', ' '],
                fractionSeparator: ','
            }
        }
    }
};
