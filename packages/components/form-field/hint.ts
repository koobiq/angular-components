import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import { CanColorCtor, KbqComponentColors, mixinColor, toBoolean } from '@koobiq/components/core';

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
        <ng-content select="[kbq-icon]"></ng-content>

        <span class="kbq-hint__text">
            <ng-content></ng-content>
        </span>
    `,
    styleUrls: ['hint.scss'],
    inputs: ['color'],
    host: {
        class: 'kbq-hint',
        '[attr.id]': 'id',
        '[class.kbq-hint_fill-text-off]': 'fillTextOff',
        '[class.kbq-hint_compact]': 'compact',
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbqHint extends KbqHintMixinBase {
    @Input() id: string = `kbq-hint-${nextHintUniqueId++}`;

    @Input() fillTextOff: boolean = false;

    @Input()
    get compact() {
        return this._compact;
    }

    set compact(value: any) {
        this._compact = toBoolean(value);
    }

    private _compact = false;

    constructor(elementRef: ElementRef) {
        super(elementRef);
    }
}
