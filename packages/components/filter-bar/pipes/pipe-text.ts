import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { ENTER, PopUpPlacements } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqBasePipe, KbqPipeMinWidth } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';

@Component({
    selector: 'kbq-pipe-text',
    imports: [
        KbqButtonModule,
        KbqPopoverModule,
        KbqInputModule,
        KbqDividerModule,
        FormsModule,
        KbqTextareaModule,
        KbqPipeButton,
        ReactiveFormsModule,
        KbqTitleModule,
        KbqPipeState,
        KbqPipeMinWidth
    ],
    templateUrl: 'pipe-text.html',
    styleUrls: ['base-pipe.scss'],
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqPipeTextComponent extends KbqBasePipe<string | null> implements AfterViewInit, OnInit {
    readonly placements = PopUpPlacements;

    /** @docs-private */
    readonly popover = viewChild.required(KbqPopoverTrigger);

    /** Whether the current pipe is disabled. */
    get disabled(): boolean {
        return !this.control.value;
    }

    /** textarea control */
    control = new FormControl<typeof this.data.value>('');

    ngOnInit(): void {
        this.control.setValue(this.data.value);
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();

        this.popover()
            .visibleChange.pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((visible) => {
                this.stateChanges.next();

                if (!visible) {
                    this.filterBar?.onClosePipe.emit(this.data);
                }
            });
    }

    onApply() {
        this.data.value = this.control.value;
        this.stateChanges.next();

        this.control.markAsPristine();
        this.popover().hide();

        this.filterBar?.onChangePipe.emit(this.data);

        setTimeout(() => this.restoreTriggerFocus());
    }

    /** @docs-private */
    onKeydown($event: KeyboardEvent) {
        if (!this.disabled && ($event.ctrlKey || $event.metaKey) && $event.keyCode === ENTER) {
            this.onApply();
        }
    }

    /** clears the pipe and triggers changes */
    override onClear() {
        super.onClear();

        this.control.reset();
    }

    /** opens popover */
    override open() {
        this.popover().show();
    }
}
