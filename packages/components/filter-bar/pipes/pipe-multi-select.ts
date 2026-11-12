import { NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    OnInit,
    Signal,
    signal,
    untracked,
    viewChild,
    viewChildren,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KbqHighlightModule,
    KbqOption,
    KbqPseudoCheckboxModule,
    KbqPseudoCheckboxState,
    tokenizeSearchQuery
} from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';
import { KbqTitleModule } from '@koobiq/components/title';
import { startWith } from 'rxjs';
import { map } from 'rxjs/operators';
import { KbqSelectValue } from '../filter-bar.types';
import { KbqBasePipe } from './base-pipe';
import { KbqMultiSelectPipeState } from './multi-select-pipe-state';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';
import { kbqFilterSelectValueNameKey, kbqFilterSelectValuesBySearch } from './select-pipe-search';

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
        KbqPseudoCheckboxModule,
        KbqHighlightModule
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

    /** Query tokens for option highlighting: tokenized like the filter, so every matched token is marked. */
    readonly searchTokens = toSignal(
        this.searchControl.valueChanges.pipe(
            startWith(this.searchControl.value),
            map((value) => tokenizeSearchQuery(value ?? ''))
        ),
        { initialValue: [] as string[] }
    );

    /** Updates on every pipe-template emission, so the options re-derive even for the same array reference. */
    private readonly templatesVersion = signal(0);

    /** Current search query; a signal so the options derivation follows the search control. */
    private readonly searchQuery = toSignal(this.searchControl.valueChanges, {
        initialValue: this.searchControl.value
    });

    /**
     * Options of the pipe template that match the search query. Follows the templates and the query,
     * and the resolved name of every option it keeps, so a translation re-filters the list without
     * replacing the option objects or clearing the query.
     */
    readonly filteredOptions: Signal<KbqSelectValue[]> = computed(() => {
        this.templatesVersion();

        return kbqFilterSelectValuesBySearch(
            this.values,
            this.searchQuery(),
            !this.isTemplateRef(this.valueTemplate),
            (value) => this.optionName(value)
        );
    });

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

    /** Number of options the "select all" action would toggle right now — template-only. */
    protected get selectAllCount(): number {
        const options = this.searchControl.value ? this.filteredOptions() : this.values;

        return options?.filter((option) => !this.isLocked(option)).length ?? 0;
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

        // A tally of zero is not a full selection: with every option locked there is nothing for "select
        // all" to act on, and `0 === 0` would otherwise collapse the value to the "all selected"
        // sentinel, dropping the locked values. Same reasoning as `allVisibleOptionsSelected` above.
        return !!tally && tally.total > 0 && tally.selected === tally.total;
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
        // here folds the locked values in right after — including on the initial replay. The version also
        // makes the option derivation follow every template update, even one that re-emits the same array.
        this.filterBar?.internalTemplatesChanges.pipe(takeUntilDestroyed()).subscribe(() => {
            this.multiSelect.normalizeValue();
            this.templatesVersion.update((version) => version + 1);
        });
    }

    /** @docs-private */
    ngOnInit(): void {
        this.multiSelect.updateInternalSelected();
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
            // Defense in depth. The lock itself is enforced upstream — `disabled` blocks every path in
            // `kbq-select` that could deselect the option — so this merge is expected to be a no-op for
            // anything the user does here. It stays because a selection can also be reshaped by a value
            // arriving from outside a user interaction.
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
        // With nothing to toggle, the toggle would still commit an empty value and announce a change.
        if (this.noOptions) return;

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
            this.data.value = this.multiSelect.mergeLocked([...this.select().value()]);
        }

        if (emitEvent) {
            this.multiSelect.emitChangePipeEvent();
        }

        this.stateChanges.next();
    }

    /** Resolved display name of a select option. */
    protected optionName(item: KbqSelectValue): string {
        return this.resolveName(item, 'select-option', kbqFilterSelectValueNameKey(item, this.values));
    }

    /**
     * Selected values the trigger shows. Normally the values behind `select.triggerValues`; when the
     * committed value contains any value with its own `nameKey`, the keyed committed values are returned
     * (so restored keyed values stay visible even when no current option matches them), together with any
     * unkeyed committed value that still matches a current option. Missing unkeyed legacy values stay
     * invisible, exactly as before this feature.
     */
    protected displayValues(select: KbqSelect): KbqSelectValue[] {
        const committed = this.data.value;

        if (Array.isArray(committed) && committed.some((value) => value.nameKey)) {
            const triggerValues = select.triggerValues.map((option) => option.value as KbqSelectValue);
            const triggerIds = new Set(triggerValues.map((value) => value.id));

            return committed.filter((value) => value.nameKey || (value.id != null && triggerIds.has(value.id)));
        }

        return select.triggerValues.map((option) => option.value as KbqSelectValue);
    }

    /** Text of the trigger and tooltip for a single selected value. */
    protected displayValue(select: KbqSelect): string {
        const value = this.displayValues(select)[0];

        if (!value) return '';

        // Without a key the trigger keeps its existing behavior — including a custom template's text.
        return kbqFilterSelectValueNameKey(value, this.values) ? this.optionName(value) : select.triggerValue;
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
        untracked(() => {
            // Without options the search is hidden and nothing in the panel takes the focus: the trigger has to,
            // or Escape never reaches the select.
            if (this.noOptions) this.focusTrigger();

            this.select().open();
        });
    }
}
