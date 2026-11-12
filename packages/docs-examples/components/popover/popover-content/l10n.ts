import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the popover-content example. */
export interface ExampleTranslation {
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

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
