import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the badge-tooltip example. */
export interface ExampleText {
    dosTooltip: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        dosTooltip:
            'DoS (аббр. англ. denial-of-service attack «отказ в обслуживании») — хакерская атака на вычислительную систему с целью довести ее до отказа, то есть создание таких условий, при которых добросовестные пользователи системы не смогут получить доступ к предоставляемым системным ресурсам (серверам), либо этот доступ будет затруднен'
    },
    default: {
        dosTooltip:
            'DoS (abbreviation of English denial-of-service attack) is a hacker attack on a computing system aimed at bringing it to failure, i.e. creating conditions under which legitimate users of the system cannot access the provided system resources (servers), or this access is difficult'
    }
};
