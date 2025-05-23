import { KbqSizeUnitsConfig } from '../formatters';

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
    },
    sizeUnits: {
        defaultUnitSystem: 'SI',
        defaultPrecision: 2,
        unitSystems: {
            SI: {
                abbreviations: ['B', 'KB', 'MB', 'GB', 'TB'],
                base: 10,
                power: 3
            },
            IEC: {
                abbreviations: ['B', 'KiB', 'MiB', 'GiB', 'TiB'],
                base: 2,
                power: 10
            }
        }
    } satisfies KbqSizeUnitsConfig
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
            groupSeparator: [' ', ' '],
            fractionSeparator: ','
        }
    },
    sizeUnits: {
        defaultUnitSystem: 'SI',
        defaultPrecision: 2,
        unitSystems: {
            SI: {
                abbreviations: ['B', 'KB', 'MB', 'GB', 'TB'],
                base: 10,
                power: 3
            },
            IEC: {
                abbreviations: ['B', 'KiB', 'MiB', 'GiB', 'TiB'],
                base: 2,
                power: 10
            }
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
    },
    sizeUnits: {
        defaultUnitSystem: 'SI',
        defaultPrecision: 2,
        unitSystems: {
            SI: {
                abbreviations: ['B', 'KB', 'MB', 'GB', 'TB'],
                base: 10,
                power: 3
            },
            IEC: {
                abbreviations: ['B', 'KiB', 'MiB', 'GiB', 'TiB'],
                base: 2,
                power: 10
            }
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
    },
    sizeUnits: {
        defaultUnitSystem: 'SI',
        defaultPrecision: 2,
        unitSystems: {
            SI: {
                abbreviations: ['B', 'KB', 'MB', 'GB', 'TB'],
                base: 10,
                power: 3
            },
            IEC: {
                abbreviations: ['B', 'KiB', 'MiB', 'GiB', 'TiB'],
                base: 2,
                power: 10
            }
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
            groupSeparator: [' ', ' '],
            fractionSeparator: ',',
            startFormattingFrom: 4
        }
    },
    sizeUnits: {
        defaultUnitSystem: 'SI',
        defaultPrecision: 2,
        unitSystems: {
            SI: {
                abbreviations: ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'],
                base: 10,
                power: 3
            },
            IEC: {
                abbreviations: ['Б', 'КиБ', 'МиБ', 'ГиБ', 'ТиБ'],
                base: 2,
                power: 10
            }
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
    },
    sizeUnits: {
        defaultUnitSystem: 'SI',
        defaultPrecision: 2,
        unitSystems: {
            SI: {
                abbreviations: ['B', 'KB', 'MB', 'GB', 'TB'],
                base: 10,
                power: 3
            },
            IEC: {
                abbreviations: ['B', 'KiB', 'MiB', 'GiB', 'TiB'],
                base: 2,
                power: 10
            }
        }
    }
};

export const tkTMFormattersData = {
    formatters: {
        number: {
            rounding: {
                separator: ' ',
                groupSeparator: '',
                thousand: 'M',
                million: 'Mn',
                billion: 'Mr',
                trillion: 'Tn'
            }
        }
    },
    input: {
        number: {
            groupSeparator: [' '],
            fractionSeparator: ','
        }
    },
    sizeUnits: {
        defaultUnitSystem: 'SI',
        defaultPrecision: 2,
        unitSystems: {
            SI: {
                abbreviations: ['B', 'KB', 'MB', 'GB', 'TB'],
                base: 10,
                power: 3
            },
            IEC: {
                abbreviations: ['B', 'KiB', 'MiB', 'GiB', 'TiB'],
                base: 2,
                power: 10
            }
        }
    }
};
