import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { AsyncPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    input,
    OnInit,
    output,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqButton, KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqFormsModule, PopUpPlacements, PopUpSizes } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { merge, Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { KbqFilterBar } from './filter-bar';
import { KbqFilterBarButton } from './filter-bar-button';
import { KbqFilter, KbqSaveFilterError, KbqSaveFilterEvent, KbqSaveFilterStatuses } from './filter-bar.types';
import { KbqFilterSavePopover } from './filter-save-popover';

@Component({
    selector: 'kbq-filters',
    imports: [
        ReactiveFormsModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqDividerModule,
        KbqIcon,
        KbqTitleModule,
        KbqInputModule,
        KbqFilterBarButton,
        AsyncPipe,
        KbqTooltipTrigger,
        KbqPopoverModule,
        FormsModule,
        KbqFormsModule,
        KbqFilterSavePopover
    ],
    templateUrl: 'filters.html',
    styleUrls: ['filters.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-filters'
    },
    exportAs: 'kbqFilters'
})
export class KbqFilters implements OnInit {
    /** @docs-private */
    protected readonly elementRef = inject(ElementRef);
    /** @docs-private */
    protected readonly destroyRef = inject(DestroyRef);
    /** @docs-private */
    protected readonly focusMonitor = inject(FocusMonitor);
    /** @docs-private */
    protected readonly placements = PopUpPlacements;
    /** @docs-private */
    protected readonly styles = KbqButtonStyles;
    /** @docs-private */
    protected readonly colors = KbqComponentColors;

    /** KbqFilterBar instance */
    protected readonly filterBar = inject(KbqFilterBar);

    /** @docs-private */
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    /** @docs-private */
    protected readonly mainButton = viewChild.required<KbqButton>('mainButton');
    /** @docs-private */
    protected readonly saveNewFilterButton = viewChild.required<KbqButton>('saveNewFilterButton');
    /** @docs-private */
    protected readonly filterActionsButton = viewChild.required<KbqButton>('filterActionsButton');

    /** @docs-private */
    protected readonly popover = viewChild.required(KbqPopoverTrigger);
    /** @docs-private */
    protected readonly dropdown = viewChild.required(KbqDropdownTrigger);
    /** @docs-private */
    protected readonly filterActionsDropdown = viewChild<KbqDropdownTrigger>('filterActionsButton');

    /** @docs-private */
    protected readonly savePopover = viewChild.required(KbqFilterSavePopover);

    private readonly search = viewChild.required<ElementRef>('search');

    /** control for search filter */
    readonly searchControl = new FormControl<string | null>(null);
    /** filtered by search filters */
    filteredOptions: Observable<KbqFilter[]>;

    /** @docs-private */
    protected readonly popoverSize = PopUpSizes.Medium;
    /** @docs-private */
    protected readonly popoverOffset: number = 4;

    readonly filters = input.required<KbqFilter[]>();

    /** Event that is generated whenever the user selects a filter. */
    readonly onSelectFilter = output<KbqFilter>();
    /**
     * Event that is generated whenever the user save a filter.
     *
     * The emitted `filter` shares its pipe objects with the live filter by design (so the rendered pipes keep
     * their identity across a save instead of being destroyed and recreated). Consumers that persist
     * `event.filter` as an immutable record should snapshot it first (e.g. via `KbqFilterBar.saveFilterState`
     * or a structural copy) — otherwise later in-place pipe edits will mutate the stored reference.
     */
    readonly onSave = output<KbqSaveFilterEvent>();
    /** Event that is generated whenever the user change a filter. */
    readonly onChangeFilter = output<KbqSaveFilterEvent>();
    /** Event that is generated whenever the user remove a filter. */
    readonly onRemoveFilter = output<KbqFilter>();
    /** Event that is generated whenever the user reset a filter changes. */
    readonly onResetFilterChanges = output<KbqFilter | null>();

    /** Component state. true if opened dropdown or popup */
    get opened(): boolean {
        return !!(this.popover()?.isOpen || this.dropdown()?.opened);
    }

    /** Component state. true if opened dropdown or popup of filterActions */
    get filterActionsOpened(): boolean {
        return !!(this.popover()?.isOpen || this.filterActionsDropdown()?.opened);
    }

    /** Selected filter. Kept as a plain getter facade over the bar's `filter` model. */
    get filter(): KbqFilter | null {
        return this.filterBar.filter();
    }

    /** Component state. True if 'filters' input contains no elements. */
    get isEmpty(): boolean {
        return this.filters().length === 0;
    }

    /** localized data
     * @docs-private */
    get localeData() {
        return this.filterBar.configuration.filters;
    }

    /** Current focus origin state.
     * @docs-private */
    get focusOrigin(): FocusOrigin {
        return this._focusOrigin;
    }

    private _focusOrigin: FocusOrigin = null;

    private focusedElementBeforeOpen: KbqButton | null;

    ngOnInit(): void {
        this.filteredOptions = merge(
            of(this.filters()),
            this.searchControl.valueChanges.pipe(map((value) => this.getFilteredOptions(value)))
        );

        this.focusMonitor
            .monitor(this.elementRef, true)
            .pipe(
                filter((origin) => !!origin),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((origin) => (this._focusOrigin = origin));
    }

    /** @docs-private */
    focusedElementBeforeIs(button: KbqButton): boolean {
        return this.focusedElementBeforeOpen === button;
    }

    selectFilter(filter: KbqFilter) {
        // Isolate the active filter from the saved source with a shallow structural copy (new filter object
        // + new pipes array + per-pipe shallow copy) instead of a deep `structuredClone`. Every pipe writes
        // its `value` by reassignment (never in-place mutation), so this fully isolates subsequent edits
        // while preserving any non-cloneable payload inside `value`. `structuredClone` (P2-20) is reserved
        // for the explicit save/restore boundary (`KbqFilterBar.saveFilterState`/`restoreFilterState`).
        this.filterBar.internalFilterChanges.next({ ...filter, pipes: filter.pipes.map((pipe) => ({ ...pipe })) });

        this.onSelectFilter.emit(filter);
    }

    saveChanges() {
        const current = this.filterBar.filter();

        if (!current) return;

        // Immutable update (new reference) so the `filter` signal reacts; `internalFilterChanges` sets the
        // signal and emits `filterChange`.
        const updated = { ...current, saved: true, changed: false };

        this.filterBar.internalFilterChanges.next(updated);

        this.onSave.emit({
            filter: updated,
            filterBar: this.filterBar,
            status: KbqSaveFilterStatuses.OnlyChanges
        });
    }

    restoreFocus() {
        // The popover can be opened from the dropdown item or programmatically, paths that never
        // capture a trigger via `saveFocusedElement`. Fall back to the main button so focus returns
        // to the filters control instead of being dropped on `<body>` (WCAG 2.4.3).
        const target = this.focusedElementBeforeOpen ?? this.mainButton();

        if (target && !target.disabled) {
            this.focusMonitor.focusVia(target.elementRef, this.focusOrigin);
        }

        this.focusedElementBeforeOpen = null;
    }

    /** @docs-private */
    saveFocusedElement(button?: KbqButton) {
        this.focusedElementBeforeOpen = button || null;
    }

    /** Restore focus when the save popover reports it closed. @docs-private */
    onSavePopoverClosed(restoreFocus: boolean) {
        if (restoreFocus) this.restoreFocus();

        this.changeDetectorRef.markForCheck();
    }

    /** @docs-private */
    stopEventPropagation(event: Event) {
        event.stopPropagation();
    }

    /** @docs-private */
    searchKeydownHandler(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            this.closePopover();
        } else {
            this.stopEventPropagation(event);
        }
    }

    /** @docs-private */
    onDropdownOpen() {
        this.searchControl.setValue(null);
        setTimeout(() => this.search().nativeElement.focus());
    }

    resetFilterChanges() {
        this.filterBar.resetFilterChangedState();

        this.onResetFilterChanges.emit(this.filter!);
    }

    removeFilter() {
        this.onRemoveFilter.emit(this.filter!);

        setTimeout(() => this.focusMonitor.focusVia(this.mainButton().elementRef, this.focusOrigin), 0);
    }

    /** Hide the popup and restore focus.
     * Use this method in the onSave or onChangeFilter events after the data has been successfully saved. */
    filterSavedSuccessfully() {
        this.savePopover().savedSuccessfully();

        setTimeout(() => this.restoreFocus(), 0);

        this.changeDetectorRef.markForCheck();
    }

    /** Shows an error. Use this method in the onSave or onChangeFilter events if saving data failed. */
    filterSavedUnsuccessfully(error?: KbqSaveFilterError) {
        // Re-enable the name control FIRST: `enable()` re-runs the control's validators and would wipe a
        // custom `filterNameAlreadyExist` error set beforehand, so apply the error AFTER re-enabling —
        // otherwise the inline "name already exists" message never renders.
        this.savePopover().savedUnsuccessfully();

        this.showError(error);

        this.changeDetectorRef.markForCheck();
    }

    // Delegating facade to the extracted `KbqFilterSavePopover`: the save-popover state, templates and
    // logic live in that child; these members keep `KbqFilters`' public surface for callers and the template.

    /** @docs-private */
    get filterName(): FormControl<string | null> {
        return this.savePopover().filterName;
    }

    /** @docs-private */
    get saveNewFilter(): boolean {
        return this.savePopover().saveNewFilter;
    }

    /** @docs-private */
    set saveNewFilter(value: boolean) {
        this.savePopover().saveNewFilter = value;
    }

    /** @docs-private */
    get isSaving(): boolean {
        return this.savePopover().isSaving;
    }

    /** @docs-private */
    set isSaving(value: boolean) {
        this.savePopover().isSaving = value;
    }

    /** @docs-private */
    get showFilterSavingError(): boolean {
        return this.savePopover().showFilterSavingError;
    }

    /** @docs-private */
    set showFilterSavingError(value: boolean) {
        this.savePopover().showFilterSavingError = value;
    }

    /** @docs-private */
    get filterSavingErrorText(): string {
        return this.savePopover().filterSavingErrorText;
    }

    /** header of popover. Depends on the mode
     * @docs-private */
    get popoverHeader(): string {
        return this.savePopover().popoverHeader;
    }

    /** @docs-private */
    openSaveAsNewFilterPopover() {
        this.savePopover().openSaveAsNewFilterPopover();
    }

    /** @docs-private */
    openChangeFilterNamePopover() {
        this.savePopover().openChangeFilterNamePopover();
    }

    /** @docs-private */
    saveAsNew(event?: Event) {
        this.savePopover().saveAsNew(event);
    }

    /** @docs-private */
    showError(error?: KbqSaveFilterError) {
        this.savePopover().showError(error);
    }

    /** @docs-private */
    closePopover(restoreFocus: boolean = true) {
        this.savePopover().close(restoreFocus);
    }

    private getFilteredOptions(value: string | null): KbqFilter[] {
        return value
            ? this.filters().filter((filter) => filter.name.toLowerCase().includes(value.toLowerCase()))
            : this.filters();
    }
}
