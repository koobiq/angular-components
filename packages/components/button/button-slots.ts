import { Directive } from '@angular/core';

/** Marks content to be projected into the prefix (leading) slot of a button. */
@Directive({
    selector: '[kbqButtonPrefix]',
    host: {
        class: 'kbq-button-prefix'
    }
})
export class KbqButtonPrefix {}

/** Marks content to be projected into the suffix (trailing) slot of a button. */
@Directive({
    selector: '[kbqButtonSuffix]',
    host: {
        class: 'kbq-button-suffix'
    }
})
export class KbqButtonSuffix {}
