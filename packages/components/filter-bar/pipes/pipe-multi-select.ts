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

        const select = this.select();

        if (!select?.selectionModel) return 'unchecked';

        if (select.selectionModel.selected.length === this.values.length) {
            return 'checked';
        } else if (!select.selectionModel.selected.length) {
            return 'unchecked';
        }

        return 'indeterminate';
    }

    /** true if all visible options selected */
    get allVisibleOptionsSelected(): boolean {
        return this.visibleOptions?.every((option) => option.selected);
    }

    /** true if all options selected */
    get allOptionsSelected(): boolean {
        const select = this.select();

        if (!select?.selectionModel) return false;

        return select.triggerValues.length === this.values?.length;
    }

    get selectedAllEqualsSelectedNothing(): boolean {
        return this.multiSelect.selectedAllEqualsSelectedNothing;
    }

    private get visibleOptions(): KbqOption[] {
        return this.options()?.filter((option) => option.selectable());
    }

    private selectionAllInProgress = false;
    private readonly multiSelect = new KbqMultiSelectPipeState({
        data: this.data,
        filterBar: this.filterBar,
        allOptionsSelected: () => this.allOptionsSelected
    });

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
            this.data.value = item;
        }

        this.multiSelect.emitChangePipeEvent();

        this.stateChanges.next();
    }

    /** @docs-private */
    onClear() {
        this.data.value = [];

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
            this.data.value = [...this.select().value];
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
