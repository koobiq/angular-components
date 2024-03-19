import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
    ElementRef,
    Input,
    Directive
} from '@angular/core';
import { CanColor, CanColorCtor, KbqComponentColors, mixinColor } from '@koobiq/components/core';


export type ProgressBarMode = 'determinate' | 'indeterminate';

let idIterator = 0;

const MIN_PERCENT = 0;
const MAX_PERCENT = 100;

/** @docs-private */
export class KbqProgressBarBase {
    constructor(public elementRef: ElementRef) {}
}

/** @docs-private */
export const KbqProgressBarMixinBase:
    CanColorCtor & typeof KbqProgressBarBase = mixinColor(KbqProgressBarBase, KbqComponentColors.Theme);

@Directive({
    selector: '[kbq-progress-bar-text]',
    host: {
        class: 'kbq-progress-bar-text'
    }
})
export class KbqProgressBarText {}

@Directive({
    selector: '[kbq-progress-bar-caption]',
    host: {
        class: 'kbq-progress-bar-caption'
    }
})
export class KbqProgressBarCaption {}

@Component({
    selector: 'kbq-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['color'],
    host: {
        '[attr.id]': 'id',
        class: 'kbq-progress-bar',
        '[class.kbq-progress-bar_determinate]': 'mode === "determinate"',
        '[class.kbq-progress-bar_indeterminate]': 'mode === "indeterminate"'
    }
})
export class KbqProgressBar extends KbqProgressBarMixinBase implements CanColor {
    @Input() id: string = `kbq-progress-bar-${idIterator++}`;
    @Input() value: number = 0;
    @Input() mode: ProgressBarMode = 'determinate';

    constructor(elementRef: ElementRef) {
        super(elementRef);
    }

    get percentage(): number {
        return Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, this.value));
    }
}
