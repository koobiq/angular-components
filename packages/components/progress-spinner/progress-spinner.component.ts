import { ChangeDetectionStrategy, Component, Directive, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import { CanColor, CanColorCtor, KbqComponentColors, mixinColor } from '@koobiq/components/core';

export type ProgressSpinnerMode = 'determinate' | 'indeterminate';

export type ProgressSpinnerSize = 'compact' | 'big';

let id = 0;

const MIN_PERCENT = 0;
const MAX_PERCENT = 100;

@Directive({
    selector: '[kbq-progress-spinner-text]',
    host: {
        class: 'kbq-progress-spinner-text',
    },
})
export class KbqProgressSpinnerText {}

@Directive({
    selector: '[kbq-progress-spinner-caption]',
    host: {
        class: 'kbq-progress-spinner-caption',
    },
})
export class KbqProgressSpinnerCaption {}

/** @docs-private */
export class KbqProgressSpinnerBase {
    constructor(public elementRef: ElementRef) {}
}

/** @docs-private */
export const KbqProgressSpinnerMixinBase: CanColorCtor & typeof KbqProgressSpinnerBase = mixinColor(
    KbqProgressSpinnerBase,
    KbqComponentColors.Theme,
);

const MAX_DASH_ARRAY = 295;

@Component({
    selector: 'kbq-progress-spinner',
    templateUrl: './progress-spinner.component.html',
    styleUrls: ['./progress-spinner.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['color'],
    host: {
        class: 'kbq-progress-spinner',
        '[class.kbq-progress-spinner_big]': `size === 'big'`,
        '[class.kbq-progress-spinner_indeterminate]': `mode === 'indeterminate'`,
        '[attr.id]': 'id',
    },
})
export class KbqProgressSpinner extends KbqProgressSpinnerMixinBase implements CanColor {
    @Input() id: string = `kbq-progress-spinner-${id++}`;
    @Input() value: number = 0;
    @Input() mode: ProgressSpinnerMode = 'determinate';

    @Input()
    get size(): ProgressSpinnerSize | string {
        return this._size;
    }

    set size(value: ProgressSpinnerSize | string) {
        this._size = value;

        this.svgCircleRadius = value === 'big' ? '47%' : '42.5%';
    }

    private _size: ProgressSpinnerSize | string = 'compact';

    svgCircleRadius: string = '42.5%';

    constructor(elementRef: ElementRef) {
        super(elementRef);
    }

    get percentage(): number {
        return Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, this.value)) / MAX_PERCENT;
    }

    get dashOffsetPercent(): string {
        return `${MAX_DASH_ARRAY - this.percentage * MAX_DASH_ARRAY}%`;
    }
}
