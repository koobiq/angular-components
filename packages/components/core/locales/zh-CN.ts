

export const znCNLocaleData = {
    'zh-CN': {
        select: { hiddenItemsText: '更多的'},
        datepicker: {
            placeholder: '年/月/日'
        },
        timepicker: {
            placeholder: {
                full: '时:分:秒',
                short: '时:分'
            }
        },
        formatters: {
            number: {
                rounding: {
                    separator: ' ',
                    groupSeparator: '.',
                    tenThousand: '万',
                    oneHundredMillions: '亿',
                    trillion: '兆'
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
