

export const ptBRLocaleData = {
    'pt-BR': {
        select: { hiddenItemsText: 'mais'},
        datepicker: {
            placeholder: 'dd/mm/yyyy'
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
                    separator: ' ',
                    groupSeparator: ',',
                    thousand: 'mil',
                    million: 'mi',
                    billion: 'bi',
                    trillion: 'tri'
                }
            }
        },
        input: {
            number: {
                groupSeparator: ['.'],
                fractionSeparator: ','
            }
        }
    }
};
