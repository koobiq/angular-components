import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, Signal, viewChild, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';
import { KbqTitleModule } from '@koobiq/components/title';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { KbqSelectValue } from '../filter-bar.types';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';
import { kbqFilterSelectValuesBySearch } from './select-pipe-search';

@Component({
    selector: 'kbq-pipe-select',
    imports: [
        KbqButtonModule,
        KbqDividerModule,
        KbqSelectModule,
        KbqPipeState,
        KbqPipeButton,
        KbqTitleModule,
        NgTemplateOutlet,
        KbqIcon,
        KbqInputModule,
        ReactiveFormsModule
    ],
    templateUrl: 'pipe-select.html',
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
export class KbqPipeSelectComponent extends KbqBasePipe<KbqSelectValue> implements AfterViewInit {
    /** control for search options */
    readonly searchControl = new FormControl<string | null>(null);
    /**
     * Options of the pipe template that match the search query. Follows the templates too, so options
     * supplied after initialization render on first open.
     */
    readonly filteredOptions: Signal<KbqSelectValue[]> = toSignal(
        merge(this.filterBar!.internalTemplatesChanges, this.searchControl.valueChanges).pipe(
            map(() => this.getFilteredOptions())
        ),
        { requireSync: true }
    );

    /** @docs-private */
    readonly select = viewChild.required(KbqSelect);

    /** selected value */
    get selected() {
        return this.data.value;
    }

    /** Whether the current pipe is empty. */
    get isEmpty(): boolean {
        return !this.data.value;
    }

    override ngAfterViewInit() {
        super.ngAfterViewInit();

        this.select()
            .closedStream.pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.filterBar?.onClosePipe.emit(this.data));
    }

    onSelect(item: KbqSelectValue) {
        this.data.value = item;
        this.filterBar?.onChangePipe.emit(this.data);
        this.stateChanges.next();

        setTimeout(() => this.restoreTriggerFocus());
    }

    /** Comparator of selected options */
    compareByValue = (o1: Pick<KbqSelectValue, 'id'> | null, o2: Pick<KbqSelectValue, 'id'> | null): boolean =>
        !!o1 && !!o2 && o1.id === o2.id;

    /** opens select */
    override open() {
        // Without options the search is hidden and nothing in the panel takes the focus: the trigger has to,
        // or Escape never reaches the select.
        if (this.noOptions) this.focusTrigger();

        this.select().open();
    }

    private getFilteredOptions(): KbqSelectValue[] {
        return kbqFilterSelectValuesBySearch(
            this.values,
            this.searchControl.value,
            !this.isTemplateRef(this.valueTemplate)
        );
    }
}
