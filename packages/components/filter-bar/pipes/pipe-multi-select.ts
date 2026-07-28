import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnInit,
    viewChild,
    viewChildren,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqOption, KbqPseudoCheckboxModule, KbqPseudoCheckboxState } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';
import { KbqTitleModule } from '@koobiq/components/title';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { KbqSelectValue } from '../filter-bar.types';
import { KbqBasePipe } from './base-pipe';
import { KbqMultiSelectPipeState } from './multi-select-pipe-state';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';

@Component({
    selector: 'kbq-pipe-multi-select',
    imports: [
        FormsModule,
        KbqButtonModule,
        KbqDividerModule,
        KbqSelectModule,
        KbqPipeState,
        KbqBadgeModule,
        KbqPipeButton,
        KbqTitleModule,
        NgTemplateOutlet,
        KbqIconModule,
        KbqInputModule,
        ReactiveFormsModule,
        AsyncPipe,
        KbqPseudoCheckboxModule
    ],
    templateUrl: 'pipe-multi-select.html',
    styleUrls: ['base-pipe.scss', 'pipe-multiselect.scss'],
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqPipeMultiSelectComponent extends KbqBasePipe<KbqSelectValue[]> implements AfterViewInit, OnInit {
    /** control for search options */
    readonly searchControl = new FormControl<string | null>(null);
    /** filtered by search options */
    filteredOptions: Observable<KbqSelectValue[]>;

    /** @docs-private */
    readonly select = viewChild.required(KbqSelect);

    /** @docs-private */
    readonly options = viewChildren(KbqOption);

    /** selected value */
    get selected() {
        return this.multiSelect.selected;
    }

    /** Whether the current pipe is empty. */
    get isEmpty(): boolean {
        return this.multiSelect.isEmpty(super.isEmpty);
    }

    /** state for checkbox 'select all'. */
    get checkboxState(): KbqPseudoCheckboxState {
        if (!this.options()) return 'unchecked';

        const tally = this.unlockedTally;

        if (!tally) return 'unchecked';

        if (!tally.selected) {
            return 'unchecked';
        } else if (tally.selected === tally.total) {
            return 'checked';
        }

        return 'indeterminate';
    }

    /** true if all visible options selected */
    get allVisibleOptionsSelected(): boolean {
        const visible = this.visibleOptions;

        // `[].every()` is `true`: with every visible option locked there is nothing for "select all" to
        // act on, and claiming "all selected" would send the toggle down the deselect branch instead.
        return !!visible?.length && visible.every((option) => option.selected);
    }

    /** true if all options selected */
    get allOptionsSelected(): boolean {
        const tally = this.unlockedTally;

        return !!tally && tally.selected === tally.total;
    }

    /**
     * Selection tally restricted to the options the user can actually toggle — the one place the
     * "ignore the locked options" rule of "select all" is expressed. `null` while there is nothing to
     * tally: no options came from the pipe template yet, or the view is not up.
     */
    private get unlockedTally(): { total: number; selected: number } | null {
        const select = this.select();

        if (!this.values || !select?.selectionModel) return null;

        return this.multiSelect.unlockedTally(
            this.values,
            select.selectionModel.selected.map((option) => option.value)
        );
    }

    get selectedAllEqualsSelectedNothing(): boolean {
        return this.multiSelect.selectedAllEqualsSelectedNothing;
    }

    private get visibleOptions(): KbqOption[] {
        // Excluding the disabled options excludes the locked ones from "select all": `KbqOption.select()`
        // and `deselect()` do not consult `disabled`, so filtering has to happen here.
        return this.options()?.filter((option) => option.selectable() && !option.disabled);
    }

    private selectionAllInProgress = false;
    private readonly multiSelect = new KbqMultiSelectPipeState({
        data: this.data,
        filterBar: this.filterBar,
        allOptionsSelected: () => this.allOptionsSelected,
        lockedValues: () => this.lockedValues ?? [],
        isSameValue: (first, second) =>
            (this.optionCompareWith ?? this.compareByValue)(first as KbqSelectValue, second as KbqSelectValue),
        emptyValue: () => []
    });

    constructor() {
        super();

        // The subscription established by `KbqBasePipe`'s constructor captured the base `updateTemplates`,
        // which refreshes `lockedValues` but knows nothing about the committed value. Subscribing again
        // here folds the locked values in right after — including on the initial replay.
        this.filterBar?.internalTemplatesChanges
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.multiSelect.normalizeValue());
    }

    /** @docs-private */
    ngOnInit(): void {
        this.multiSelect.updateInternalSelected();

        this.filteredOptions = merge(this.filterBar!.internalTemplatesChanges, this.searchControl.valueChanges).pipe(
            map(this.getFilteredOptions),
            takeUntilDestroyed(this.destroyRef)
        );
    }

    override ngAfterViewInit() {
        super.ngAfterViewInit();

        this.multiSelect.markViewInitialized();

        this.select()
            .closedStream.pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.filterBar?.onClosePipe.emit(this.data));
    }

    /** @docs-private */
    onSelect(item: KbqSelectValue[]) {
        if (this.selectionAllInProgress) return;

        if (this.selectedAllEqualsSelectedNothing && this.allOptionsSelected) {
            this.data.value = [];
        } else {
            // Re-assert the locked options: `kbq-select` toggles a single shift-clicked option straight
            // through its selection model, without consulting `disabled`.
            this.data.value = this.multiSelect.mergeLocked(item);
        }

        this.multiSelect.emitChangePipeEvent();

        this.stateChanges.next();
    }

    /** Whether the option cannot be deselected by the user. Template-only. */
    protected isLocked(item: KbqSelectValue): boolean {
        return this.multiSelect.isLocked(item);
    }

    /** @docs-private */
    onClear() {
        this.data.value = this.multiSelect.clearedValue();

        this.multiSelect.updateInternalSelected();

        this.filterBar?.onClearPipe.emit(this.data);
        this.filterBar?.onChangePipe.emit(this.data);
        this.stateChanges.next();
    }

    /** @docs-private */
    toggleSelectionAllByEnterKey() {
        if (this.data.selectAll && this.select().keyManager.activeItemIndex === 0) {
            this.toggleSelectionAll();
        }
    }

    /** @docs-private */
    toggleSelectionAll(emitEvent: boolean = true) {
        this.selectionAllInProgress = true;

        if (this.allVisibleOptionsSelected) {
            this.visibleOptions.forEach((option) => option.deselect());
        } else {
            this.visibleOptions.forEach((option) => option.select());
        }

        this.selectionAllInProgress = false;

        if (this.selectedAllEqualsSelectedNothing && this.allOptionsSelected) {
            this.data.value = [];
        } else {
            this.data.value = this.multiSelect.mergeLocked([...this.select().value]);
        }

        if (emitEvent) {
            this.multiSelect.emitChangePipeEvent();
        }

        this.stateChanges.next();
    }

    /** Comparator of selected options. Two null/absent values never match (aligned with the select pipe). */
    compareByValue = (o1: Pick<KbqSelectValue, 'id'> | null, o2: Pick<KbqSelectValue, 'id'> | null): boolean =>
        !!o1 && !!o2 && o1.id === o2.id;

    /** handler for select all options in select */
    selectAllHandler = (event: KeyboardEvent) => {
        event.preventDefault();

        this.toggleSelectionAll();
    };

    /** @docs-private */
    onClose() {
        if (this.allOptionsSelected) {
            this.multiSelect.updateInternalSelected();
        }

        setTimeout(() => this.restoreTriggerFocus());
    }

    /** opens select */
    override open() {
        this.select().open();
    }

    private getFilteredOptions = (): KbqSelectValue[] => {
        const search = this.searchControl.value;

        return search
            ? this.values.filter((item: KbqSelectValue) => item.name.toLowerCase().includes(search.toLowerCase()))
            : this.values;
    };
}
