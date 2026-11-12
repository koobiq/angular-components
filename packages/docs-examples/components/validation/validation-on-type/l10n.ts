import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the validation-on-type example. */
export interface ExampleTranslation {
    folderName: string;
    onlyLettersAndNumbers: string;
    lettersAndNumbers: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        folderName: 'Имя папки',
        onlyLettersAndNumbers: 'Только буквы и цифры',
        lettersAndNumbers: 'Буквы и цифры'
    },
    default: {
        folderName: 'Folder name',
        onlyLettersAndNumbers: 'Only letters and numbers',
        lettersAndNumbers: 'Letters and numbers'
    }
};
