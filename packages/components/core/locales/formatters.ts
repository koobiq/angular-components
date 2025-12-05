import { KbqSizeUnitsConfig } from '../formatters';
import { KbqNumberFormatOptions, KbqNumberInputLocaleConfig } from './types';

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
        } satisfies KbqNumberInputLocaleConfig
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
            },
            decimal: {
                viewGroupSeparator: '\u2009'
            } satisfies KbqNumberFormatOptions
        }
    },
    input: {
        number: {
            // nbsp is generated automatically and used by default in spec
            groupSeparator: [' ', ' ', '\u2009'],
            fractionSeparator: ',',
            viewGroupSeparator: '\u2009'
        } satisfies KbqNumberInputLocaleConfig
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
        } satisfies KbqNumberInputLocaleConfig
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
            },
            decimal: {
                viewGroupSeparator: '\u2009'
            } satisfies KbqNumberFormatOptions
        }
    },
    input: {
        number: {
            // nbsp is generated automatically and used by default in spec
            groupSeparator: [' ', ' ', '\u2009'],
            fractionSeparator: ',',
            startFormattingFrom: 4,
            viewGroupSeparator: '\u2009'
        } satisfies KbqNumberInputLocaleConfig
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
        } satisfies KbqNumberInputLocaleConfig
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
