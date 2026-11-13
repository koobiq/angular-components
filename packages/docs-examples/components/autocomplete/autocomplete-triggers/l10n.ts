import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the autocomplete-triggers example. */
export interface ExampleTranslation {
    comment: string;
    typeTriggers: string;
    closedLabel: string;
    escalateLabel: string;
    signLabel: string;
    closedInsert: string;
    escalateInsert: string;
    signInsert: string;
    alice: string;
    bob: string;
    carol: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        comment: 'Комментарий',
        typeTriggers: 'Введите / для сниппета или @, чтобы упомянуть коллегу',
        closedLabel: '/closed — закрывающая заметка',
        escalateLabel: '/escalate — заметка об эскалации',
        signLabel: '/sign — подпись',
        closedInsert: 'Закрыто как ложное срабатывание.',
        escalateInsert: 'Передано на вторую линию.',
        signInsert: 'С уважением, команда SOC',
        alice: 'Алиса Джонсон',
        bob: 'Боб Смит',
        carol: 'Кэрол Уайт'
    },
    default: {
        comment: 'Comment',
        typeTriggers: 'Type / for a snippet or @ to mention a colleague',
        closedLabel: '/closed — closing note',
        escalateLabel: '/escalate — escalation note',
        signLabel: '/sign — signature',
        closedInsert: 'Closed as a false positive.',
        escalateInsert: 'Escalated to the second line.',
        signInsert: 'Best regards, SOC team',
        alice: 'Alice Johnson',
        bob: 'Bob Smith',
        carol: 'Carol White'
    }
};
