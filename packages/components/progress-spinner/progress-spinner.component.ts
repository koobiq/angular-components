import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, Input, ViewEncapsulation } from '@angular/core';
import { KbqColorDirective, KbqComponentColors } from '@koobiq/components/core';

export type ProgressSpinnerMode = 'determinate' | 'indeterminate';

//@TODO use Exclude<KbqDefaultSizes, 'normal'> from '@koobiq/components/core' instead
export type ProgressSpinnerSize = 'compact' | 'big';

let id = 0;

const MIN_PERCENT = 0;
const MAX_PERCENT = 100;

@Directive({
    selector: '[kbq-progress-spinner-text]',
    host: {
        class: 'kbq-progress-spinner-text'
    }
})
export class KbqProgressSpinnerText {}

@Directive({
    selector: '[kbq-progress-spinner-caption]',
    host: {
        class: 'kbq-progress-spinner-caption'
    }
})
export class KbqProgressSpinnerCaption {}

const MAX_DASH_ARRAY = 295;

@Component({
    selector: 'kbq-progress-spinner',
    imports: [NgStyle],
    templateUrl: './progress-spinner.component.html',
    styleUrls: ['./progress-spinner.scss', './progress-spinner-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-progress-spinner',
        '[class.kbq-progress-spinner_big]': `size === 'big'`,
        '[class.kbq-progress-spinner_indeterminate]': `mode === 'indeterminate'`,
        '[attr.id]': 'id'
    }
})
export class KbqProgressSpinner extends KbqColorDirective {
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

    get percentage(): number {
        return Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, this.value)) / MAX_PERCENT;
    }

    get dashOffsetPercent(): string {
        return `${MAX_DASH_ARRAY - this.percentage * MAX_DASH_ARRAY}%`;
    }

    constructor() {
        super();

        this.color = KbqComponentColors.Theme;
        this.setDefaultColor(KbqComponentColors.Theme);
    }
}
