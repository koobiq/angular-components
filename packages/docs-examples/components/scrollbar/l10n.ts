import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the scrollbar examples. */
export interface ExampleText {
    scrollTop: string;
    scrollBottom: string;
    scrollStart: string;
    scrollEnd: string;
    scrollToElement: string;
    scrollIntoView: string;
    addItems: string;
    bruteForce1: string;
    bruteForce2: string;
    bruteForce3: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        scrollTop: 'Наверх',
        scrollBottom: 'Вниз',
        scrollStart: 'В начало',
        scrollEnd: 'В конец',
        scrollToElement: 'ПРОКРУТКА К ЭЛЕМЕНТУ',
        scrollIntoView: 'ПРОКРУТКА В ОБЛАСТЬ ВИДИМОСТИ',
        addItems: 'Добавить элементы',
        bruteForce1:
            'В криптографии атака полным перебором (исчерпывающий поиск ключа) — это криптоаналитическая атака, при которой злоумышленник перебирает множество возможных ключей или паролей в надежде рано или поздно угадать верный. Теоретически этот метод можно использовать для взлома любого шифрования, не являющегося абсолютно стойким. Однако в правильно спроектированной криптосистеме вероятность успешного угадывания ключа пренебрежимо мала.',
        bruteForce2:
            'При взломе паролей этот метод очень быстро проверяет все короткие пароли, но для более длинных используются другие методы, например словарная атака, потому что полный перебор занимает слишком много времени. Более длинные пароли, парольные фразы и ключи имеют больше возможных значений, что делает их экспоненциально более устойчивыми к взлому благодаря разнообразию символов.',
        bruteForce3:
            'Эффективность атак полным перебором можно снизить с помощью растяжки ключей: это затрудняет злоумышленнику распознавание момента взлома или заставляет его выполнять больше работы для проверки каждого варианта. Одна из мер стойкости системы шифрования — время, которое теоретически потребовалось бы злоумышленнику для успешной атаки полным перебором.'
    },
    default: {
        scrollTop: 'Scroll top',
        scrollBottom: 'Scroll bottom',
        scrollStart: 'Scroll start',
        scrollEnd: 'Scroll end',
        scrollToElement: 'SCROLL TO ELEMENT',
        scrollIntoView: 'SCROLL INTO VIEW',
        addItems: 'Add items',
        bruteForce1:
            'In cryptography, a brute-force attack or exhaustive key search is a cryptanalytic attack that consists of an attacker submitting many possible keys or passwords with the hope of eventually guessing correctly. This strategy can theoretically be used to break any form of encryption that is not information-theoretically secure.[1] However, in a properly designed cryptosystem the chance of successfully guessing the key is negligible.',
        bruteForce2:
            'When cracking passwords, this method is very fast when used to check all short passwords, but for longer passwords other methods such as the dictionary attack are used because a brute-force search takes too long. Longer passwords, passphrases and keys have more possible values, making them exponentially more difficult to crack than shorter ones due to the diversity of characters.[2]',
        bruteForce3:
            'Brute-force attacks can be made less effective by implementing key stretching techniques making it more difficult for an attacker to recognize when the code has been cracked or by making the attacker do more work to test each guess. One of the measures of the strength of an encryption system is how long it would theoretically take an attacker to mount a successful brute-force attack against it.[3]'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
