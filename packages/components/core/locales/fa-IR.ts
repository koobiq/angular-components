

export const faIRLocaleData = {
    'fa-IR': {
        select: { hiddenItemsText: 'أكثر'},
        datepicker: {
            placeholder: 'روز/ ماه/سال'
        },
        timepicker: {
            placeholder: {
                full: 'ثانیه:دقیقه:ساعت',
                short: 'دقیقه:ساعت'
            }
        },
        formatters: {
            number: {
                rounding: {
                    separator: ' ',
                    groupSeparator: '٫',
                    thousand: 'هزار',
                    million: 'میلیون',
                    billion: 'م',
                    trillion: 'تریلیون',
                    rtl: true
                }
            }
        },
        input: {
            number: {
                groupSeparator: ['\u066C'],
                fractionSeparator: '\u066B'
            }
        }
    }
};
