import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    ViewEncapsulation
} from '@angular/core';
import { CanColorCtor, KbqComponentColors, mixinColor } from '@koobiq/components/core';

let nextHintUniqueId = 0;

/** @docs-private */
export class KbqHintBase {
    constructor(public elementRef: ElementRef) {}
}

/** @docs-private */
export const KbqHintMixinBase: CanColorCtor & typeof KbqHintBase = mixinColor(KbqHintBase, KbqComponentColors.Empty);

@Component({
    selector: 'kbq-hint',
    exportAs: 'kbqHint',
    template: `
        <ng-content select="[kbq-icon]" />

        <span class="kbq-hint__text">
            <ng-content />
        </span>
    `,
    styleUrls: ['hint.scss', 'hint-tokens.scss'],
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
    @Input() id: string = `kbq-hint-${nextHintUniqueId++}`;

    @Input({ transform: booleanAttribute }) fillTextOff: boolean = false;

    @Input({ transform: booleanAttribute }) compact = false;

    constructor(elementRef: ElementRef) {
        super(elementRef);
    }
}
