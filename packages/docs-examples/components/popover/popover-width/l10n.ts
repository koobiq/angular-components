import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the popover-width example. */
export interface ExampleText {
    paragraph: string;
    secondParagraph: string;
    customWidth: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        paragraph:
            'В Windows есть вещи, известные как системные переменные. Это переменные, от которых зависит функционирование Windows, потому что Windows всегда будет знать, что означают переменные и где они находятся, даже когда мы перемещаем биты и байты повсюду. Системная переменная MAX_PATH — это та, которая ограничивает имена файлов и пути к файлам до 260 символов.',
        secondParagraph:
            'Будучи переменной, вы думаете, мы могли бы изменить это. Нет, мы не должны. Это все равно что выдернуть нитку из свитера. Как только одна системная переменная изменяется, другие системные переменные и зависимые от них компоненты начинают распадаться.',
        customWidth: 'Произвольная ширина'
    },
    default: {
        paragraph:
            'In Windows there are things known as system variables. These are variables that the functioning of Windows depends on, because Windows will always know what the variables mean and where they are located, even as we move bits and bytes around. The MAX_PATH system variable is the one that limits file names and paths to 260 characters.',
        secondParagraph:
            'Being a variable, you might think we could change this. No, we must not. It is like pulling a thread out of a sweater. As soon as one system variable changes, other system variables and the components that depend on them begin to fall apart.',
        customWidth: 'Custom width'
    }
};
