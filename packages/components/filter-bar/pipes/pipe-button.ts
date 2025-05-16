import {
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    Input,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { merge } from 'rxjs';
import { KbqFilterBar } from '../filter-bar';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeState } from './pipe-state';

@Component({
    standalone: true,
    selector: 'kbq-pipe-button',
    template: `
        <button
            class="kbq-pipe__remove-button"
            [disabled]="pipe.data.disabled"
            [kbqPipeState]="pipe.data"
            [kbqTooltipDisabled]="pipe.data.disabled"
            (click)="pipe.data.cleanable ? pipe.onClear() : pipe.onRemove()"
            kbq-button
            kbqTooltip="{{ pipe.data.cleanable ? localeData.clearButtonTooltip : localeData.removeButtonTooltip }}"
        >
            <i [color]="pipe.data.disabled ? 'empty' : 'contrast'" kbq-icon="kbq-xmark-s_16"></i>
        </button>
    `,
    styleUrl: 'pipe-button.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-pipe-button'
    },
    imports: [
        KbqIcon,
        KbqButtonModule,
        KbqPipeState,
        KbqTooltipTrigger
    ]
})
export class KbqPipeButton {
    /** KbqPipe instance */
    protected readonly pipe = inject(KbqBasePipe);
    /** KbqFilterBar instance */
    protected readonly filterBar = inject(KbqFilterBar);
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    /** enables/disables read-only state */
    @Input({ transform: booleanAttribute }) readonly: boolean = false;

    /** localized data
     * @docs-private */
    get localeData() {
        return this.filterBar?.configuration.pipe;
    }

    constructor() {
        merge(this.pipe.stateChanges, this.filterBar.changes)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.changeDetectorRef.markForCheck());
    }
}
