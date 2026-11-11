import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the validation examples. */
export interface ExampleText {
    name: string;
    lastName: string;
    surname: string;
    patronymic: string;
    address: string;
    comment: string;
    email: string;
    username: string;
    number: string;
    series: string;
    estimation: string;
    requestReason: string;
    folderName: string;
    confirmNewPassword: string;
    currentPassword: string;
    newPassword: string;
    validFrom: string;
    validUntil: string;
    ipv4Address: string;
    errorAboveHint: string;
    errorReplacesHint: string;
    required: string;
    optional: string;
    min5: string;
    min8: string;
    max20: string;
    passwordsDoNotMatch: string;
    passwordTooSimilar: string;
    passwordMustDiffer: string;
    periodEndBeforeStart: string;
    hintUnderField: string;
    onlyLettersAndNumbers: string;
    onlyLatinLetters: string;
    invalidIp: string;
    checkingWithServer: string;
    invalidTags: string;
    submit: string;
    save: string;
    cancel: string;
    changePassword: string;
    openEmptyForm: string;
    openDraft: string;
    newTag: string;
    serverError: string;
    fillAtLeastOne: string;
    or: string;
    onlyNumbers: string;
    numbersAndDots: string;
    numbersAndDot: string;
    lettersAndNumbers: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        name: 'Имя',
        lastName: 'Фамилия',
        surname: 'Фамилия',
        patronymic: 'Отчество',
        address: 'Адрес',
        comment: 'Комментарий',
        email: 'Эл. почта',
        username: 'Имя пользователя',
        number: 'Номер',
        series: 'Серия',
        estimation: 'Оценка',
        requestReason: 'Причина запроса',
        folderName: 'Имя папки',
        confirmNewPassword: 'Подтвердите новый пароль',
        currentPassword: 'Текущий пароль',
        newPassword: 'Новый пароль',
        validFrom: 'Действует с',
        validUntil: 'Действует до',
        ipv4Address: 'IPv4-адрес',
        errorAboveHint: 'Сообщение об ошибке отображается над подсказкой',
        errorReplacesHint: 'Сообщение об ошибке заменяет подсказку',
        required: 'Обязательно',
        optional: 'Необязательно',
        min5: 'Минимум 5 символов',
        min8: 'Минимум 8 символов',
        max20: 'Максимум 20 символов',
        passwordsDoNotMatch: 'Пароли не совпадают',
        passwordTooSimilar: 'Новый пароль слишком похож на текущий',
        passwordMustDiffer: 'Новый пароль должен отличаться от текущего',
        periodEndBeforeStart: 'Конец периода не может быть раньше его начала',
        hintUnderField: 'Подсказка под полем',
        onlyLettersAndNumbers: 'Только буквы и цифры',
        onlyLatinLetters: 'Только латинские буквы',
        invalidIp: 'IP-адрес не соответствует стандарту RFC',
        checkingWithServer: 'Проверка на сервере…',
        invalidTags: 'Недопустимые теги:',
        submit: 'Отправить',
        save: 'Сохранить',
        cancel: 'Отмена',
        changePassword: 'Сменить пароль',
        openEmptyForm: 'Открыть пустую форму',
        openDraft: 'Открыть черновик',
        newTag: 'Новый тег...',
        serverError: 'Сервер не ответил при отправке данных. Попробуйте ещё раз.',
        fillAtLeastOne: 'Заполните хотя бы одно из полей:',
        or: 'или',
        onlyNumbers: 'Только цифры',
        numbersAndDots: 'Только цифры и точки',
        numbersAndDot: 'Только цифры и точка',
        lettersAndNumbers: 'Буквы и цифры'
    },
    default: {
        name: 'Name',
        lastName: 'Last name',
        surname: 'Surname',
        patronymic: 'Patronymic',
        address: 'Address',
        comment: 'Comment',
        email: 'Email',
        username: 'Username',
        number: 'Number',
        series: 'Series',
        estimation: 'Estimation',
        requestReason: 'Request reason',
        folderName: 'Folder name',
        confirmNewPassword: 'Confirm new password',
        currentPassword: 'Current password',
        newPassword: 'New password',
        validFrom: 'Valid from',
        validUntil: 'Valid until',
        ipv4Address: 'IPv4-address',
        errorAboveHint: 'The error message appears above the hint',
        errorReplacesHint: 'The error message replaces the hint',
        required: 'Required',
        optional: 'Optional',
        min5: 'Minimum 5 characters',
        min8: 'Minimum 8 characters',
        max20: 'Maximum 20 characters',
        passwordsDoNotMatch: 'Passwords do not match',
        passwordTooSimilar: 'The new password is too similar to the current one',
        passwordMustDiffer: 'The new password must differ from the current one',
        periodEndBeforeStart: 'The end of the period must not precede its start',
        hintUnderField: 'Hint under the field',
        onlyLettersAndNumbers: 'Only letters and numbers',
        onlyLatinLetters: 'Provide only latin letters',
        invalidIp: 'The IP address does not comply with RFC standards',
        checkingWithServer: 'Checking with the server…',
        invalidTags: 'Invalid tags:',
        submit: 'Submit',
        save: 'Save',
        cancel: 'Cancel',
        changePassword: 'Change password',
        openEmptyForm: 'Open empty form',
        openDraft: 'Open draft',
        newTag: 'New tag...',
        serverError: 'The server didn’t respond while sending data. Please try again.',
        fillAtLeastOne: 'Fill in at least one of the fields:',
        or: 'or',
        onlyNumbers: 'Only numbers',
        numbersAndDots: 'Numbers and dots only',
        numbersAndDot: 'Numbers and dot only',
        lettersAndNumbers: 'Letters and numbers'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
