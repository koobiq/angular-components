import { NgClass } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ENTER } from '@koobiq/cdk/keycodes';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqBasePipe, KbqPipeMinWidth } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';
import { KbqPipeTitleDirective } from './pipe-title';

@Component({
    selector: 'kbq-pipe-text',
    imports: [
        KbqButtonModule,
        KbqFormFieldModule,
        KbqPopoverModule,
        KbqInputModule,
        KbqDividerModule,
        FormsModule,
        KbqTextareaModule,
        NgClass,
        KbqPipeButton,
        ReactiveFormsModule,
        KbqTitleModule,
        KbqPipeState,
        KbqPipeTitleDirective,
        KbqPipeMinWidth
    ],
    templateUrl: 'pipe-text.html',
    styleUrls: ['base-pipe.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ]
})
export class KbqPipeTextComponent extends KbqBasePipe<string | null> implements AfterViewInit, OnInit {
    readonly placements = PopUpPlacements;

    /** @docs-private */
    @ViewChild(KbqPopoverTrigger) popover: KbqPopoverTrigger;

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

        this.popover.visibleChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((visible) => {
            this.stateChanges.next();

            if (!visible) {
                this.filterBar?.onClosePipe.next(this.data);
            }
        });
    }

    onApply() {
        this.data.value = this.control.value;
        this.stateChanges.next();

        this.control.markAsPristine();
        this.popover.hide();

        this.filterBar?.onChangePipe.next(this.data);
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
        this.popover.show();
    }
}
