import {
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    input,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { merge } from 'rxjs';
import { KbqFilterBar } from '../filter-bar';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeState } from './pipe-state';

@Component({
    selector: 'kbq-pipe-button',
    imports: [
        KbqIconModule,
        KbqButtonModule,
        KbqPipeState,
        KbqTooltipTrigger
    ],
    template: `
        <button
            kbqTooltip="{{ pipe.data.cleanable ? localeData.clearButtonTooltip : localeData.removeButtonTooltip }}"
            class="kbq-pipe__remove-button"
            kbq-button
            [attr.aria-label]="pipe.data.cleanable ? localeData.clearButtonTooltip : localeData.removeButtonTooltip"
            [disabled]="pipe.data.disabled"
            [kbqPipeState]="pipe.data"
            [kbqTooltipDisabled]="pipe.data.disabled"
            (click)="pipe.data.cleanable ? pipe.onClear() : pipe.onRemove()"
        >
            <i kbq-icon="kbq-xmark-s_16" aria-hidden="true" [color]="pipe.data.disabled ? 'empty' : 'contrast'"></i>
        </button>
    `,
    styleUrl: 'pipe-button.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-pipe-button'
    }
})
export class KbqPipeButton {
    /** KbqPipe instance */
    protected readonly pipe = inject(KbqBasePipe);
    /** KbqFilterBar instance */
    protected readonly filterBar = inject(KbqFilterBar);
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    /** enables/disables read-only state */
    readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });

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
