import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the markdown-paragraph example. */
export interface ExampleTranslation {
    paragraph: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        paragraph: `Атака полным перебором — это криптоаналитическая атака, которая теоретически может быть использована для попытки расшифровать любые зашифрованные данные (кроме данных, зашифрованных абсолютно стойким способом).

Такая атака может применяться, когда невозможно воспользоваться другими слабостями системы шифрования (если они есть), которые облегчили бы задачу.`
    },
    default: {
        paragraph: `A brute-force attack is a cryptanalytic attack that can, in theory, be used to attempt to decrypt any encrypted data (except for data encrypted in an information-theoretically secure manner).

Such an attack might be used when it is not possible to take advantage of other weaknesses in an encryption system (if any exist) that would make the task easier.`
    }
};
