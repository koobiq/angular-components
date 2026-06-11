import { Directive } from '@angular/core';

/** Marks an icon to be projected into the left slot of a button. */
@Directive({
    selector: '[kbqButtonLeftIcon]'
})
export class KbqButtonLeftIcon {}

/** Marks an icon to be projected into the right slot of a button. */
@Directive({
    selector: '[kbqButtonRightIcon]'
})
export class KbqButtonRightIcon {}
