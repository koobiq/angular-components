import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the validation-on-type example. */
export interface ExampleText {
    folderName: string;
    onlyLettersAndNumbers: string;
    lettersAndNumbers: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
