import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    ViewEncapsulation
} from '@angular/core';
import { CanColorCtor, KbqComponentColors, mixinColor } from '@koobiq/components/core';

let nextUniqueId = 0;

/** @docs-private */
class KbqHintBase {
    constructor(public readonly elementRef: ElementRef) {}
}

/** @docs-private */
const KbqHintMixinBase: CanColorCtor & typeof KbqHintBase = mixinColor(KbqHintBase, KbqComponentColors.Empty);

/** Hint text to be shown below the form field control. */
@Component({
    standalone: true,
    selector: 'kbq-hint',
    exportAs: 'kbqHint',
    templateUrl: './hint.html',
    styleUrls: [
        './hint.scss',
        './hint-tokens.scss'
    ],
    inputs: ['color'],
    host: {
        class: 'kbq-hint',
        '[attr.id]': 'id',
        '[class.kbq-hint_fill-text-off]': 'fillTextOff',
        '[class.kbq-hint_compact]': 'compact'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHint extends KbqHintMixinBase {
    @Input() id: string = `kbq-hint-${nextUniqueId++}`;
    @Input({ transform: booleanAttribute }) fillTextOff: boolean = false;
    @Input({ transform: booleanAttribute }) compact: boolean = false;

    constructor(public readonly elementRef: ElementRef) {
        super(elementRef);
    }
}
