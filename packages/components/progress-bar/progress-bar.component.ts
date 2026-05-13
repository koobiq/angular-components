import { ChangeDetectionStrategy, Component, Directive, Input, ViewEncapsulation } from '@angular/core';
import { KbqColorDirective, KbqComponentColors } from '@koobiq/components/core';

export type ProgressBarMode = 'determinate' | 'indeterminate';

let idIterator = 0;

const MIN_PERCENT = 0;
const MAX_PERCENT = 100;

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
    styleUrls: ['./progress-bar.scss', './progress-bar-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[attr.id]': 'id',
        class: 'kbq-progress-bar',
        '[class.kbq-progress-bar_determinate]': 'mode === "determinate"',
        '[class.kbq-progress-bar_indeterminate]': 'mode === "indeterminate"'
    }
})
export class KbqProgressBar extends KbqColorDirective {
    @Input() id: string = `kbq-progress-bar-${idIterator++}`;
    @Input() value: number = 0;
    @Input() mode: ProgressBarMode = 'determinate';

    get percentage(): number {
        return Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, this.value));
    }

    constructor() {
        super();

        this.color = KbqComponentColors.Theme;
    }
}
