import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the popover-content example. */
export interface ExampleText {
    shareProject: string;
    email: string;
    sendInvite: string;
    members: string;
    editor: string;
    viewer: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        shareProject: 'Поделиться проектом',
        email: 'Эл. почта',
        sendInvite: 'Отправить приглашение',
        members: 'Участники',
        editor: 'Редактор',
        viewer: 'Читатель'
    },
    default: {
        shareProject: 'Share project',
        email: 'Email',
        sendInvite: 'Send invite',
        members: 'Members',
        editor: 'Editor',
        viewer: 'Viewer'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
