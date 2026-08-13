import { KbqLocaleFormattersData } from './types';

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
    }
} satisfies KbqLocaleFormattersData;

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
            },
            decimal: {
                viewGroupSeparator: '\u2009'
            }
        }
    },
    input: {
        number: {
            // nbsp is generated automatically and used by default in spec
            groupSeparator: [' ', ' ', '\u2009'],
            fractionSeparator: ',',
            viewGroupSeparator: '\u2009'
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
} satisfies KbqLocaleFormattersData;

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
} satisfies KbqLocaleFormattersData;

export const ruRUFormattersData = {
    formatters: {
        number: {
            rounding: {
                separator: ' ',
                groupSeparator: ',',
                thousand: 'К',
                million: 'М',
                // Latin `B` (U+0042) according to UX Guidelines.
                billion: 'B',
                trillion: 'Т'
            },
            decimal: {
                viewGroupSeparator: '\u2009'
            }
        }
    },
    input: {
        number: {
            // nbsp is generated automatically and used by default in spec
            groupSeparator: [' ', ' ', '\u2009'],
            fractionSeparator: ',',
            startFormattingFrom: 4,
            viewGroupSeparator: '\u2009'
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
} satisfies KbqLocaleFormattersData;

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
            groupSeparator: [' ', ' ', '\u2009'],
            fractionSeparator: ',',
            viewGroupSeparator: '\u2009'
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
} satisfies KbqLocaleFormattersData;
