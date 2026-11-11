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
    withoutHeaderPanel: string;
    customStyles: string;
    magicTitle: string;
    magicText: string;
    doMagic: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        shareProject: 'Поделиться проектом',
        email: 'Эл. почта',
        sendInvite: 'Отправить приглашение',
        members: 'Участники',
        editor: 'Редактор',
        viewer: 'Читатель',
        withoutHeaderPanel: 'Без панели хедера',
        customStyles: 'Нестандартные стили и отступы',
        magicTitle: 'Абракадабра!',
        magicText: 'Таинственное слово, которому приписывалась чудодейственная сила',
        doMagic: 'Сделать магию'
    },
    default: {
        shareProject: 'Share project',
        email: 'Email',
        sendInvite: 'Send invite',
        members: 'Members',
        editor: 'Editor',
        viewer: 'Viewer',
        withoutHeaderPanel: 'Without a header panel',
        customStyles: 'Custom styles and paddings',
        magicTitle: 'Abracadabra!',
        magicText: 'A mysterious word believed to have miraculous power',
        doMagic: 'Do the magic'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
