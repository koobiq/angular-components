export const enUSFormattersData = {
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
};

export const esLAFormattersData = {
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
};

export const faIRFormattersData = {
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
};

export const ptBRFormattersData = {
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
};

export const ruRUFormattersData = {
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
};

export const zhCNFormattersData = {
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
};
