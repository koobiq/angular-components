import { AsyncPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqOption, KbqPseudoCheckboxModule, KbqPseudoCheckboxState } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';
import { KbqTitleModule } from '@koobiq/components/title';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { KbqSelectValue } from '../filter-bar.types';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';
import { KbqPipeTitleDirective } from './pipe-title';

@Component({
    selector: 'kbq-pipe-multi-select',
    imports: [
        FormsModule,
        KbqButtonModule,
        KbqDividerModule,
        KbqSelectModule,
        NgClass,
        KbqPipeState,
        KbqBadgeModule,
        KbqPipeButton,
        KbqTitleModule,
        KbqPipeTitleDirective,
        NgTemplateOutlet,
        KbqFormFieldModule,
        KbqIconModule,
        KbqInputModule,
        ReactiveFormsModule,
        AsyncPipe,
        KbqPseudoCheckboxModule
    ],
    templateUrl: 'pipe-multi-select.html',
    styleUrls: ['base-pipe.scss', 'pipe-multiselect.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ]
})
export class KbqPipeMultiSelectComponent extends KbqBasePipe<KbqSelectValue[]> implements AfterViewInit, OnInit {
    /** control for search options */
    searchControl: UntypedFormControl = new UntypedFormControl();
    /** filtered by search options */
    filteredOptions: Observable<any[]>;

    /** @docs-private */
    @ViewChild(KbqSelect) select: KbqSelect;

    /** @docs-private */
    @ViewChildren(KbqOption) options: QueryList<KbqOption>;

    /** selected value */
    get selected() {
        if (this.selectedAllEqualsSelectedNothing) {
            return this.internalSelected;
        }

        return this.data.value;
    }

    /** Whether the current pipe is empty. */
    get isEmpty(): boolean {
        return (
            super.isEmpty ||
            (Array.isArray(this.data.value) && !this.data.value.length) ||
            (this.selectedAllEqualsSelectedNothing && this.allOptionsSelected)
        );
    }

    /** state for checkbox 'select all'. */
    get checkboxState(): KbqPseudoCheckboxState {
        if (!this.options) return 'unchecked';

        if (this.select.selectionModel.selected.length === this.values.length) {
            return 'checked';
        } else if (!this.select.selectionModel.selected.length) {
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
        return this.select?.triggerValues.length === this.values?.length;
    }

    get selectedAllEqualsSelectedNothing(): boolean {
        return this.data.selectedAllEqualsSelectedNothing ?? this.filterBar!.selectedAllEqualsSelectedNothing;
    }

    private get visibleOptions(): KbqOption[] {
        return this.options?.filter((option) => option.selectable);
    }

    private selectionAllInProgress = false;
    private internalSelected: KbqSelectValue[] | null;

    /** @docs-private */
    ngOnInit(): void {
        this.updateInternalSelected();

        this.filteredOptions = merge(this.filterBar!.internalTemplatesChanges, this.searchControl.valueChanges).pipe(
            map(this.getFilteredOptions),
            takeUntilDestroyed(this.destroyRef)
        );
    }

    override ngAfterViewInit() {
        super.ngAfterViewInit();

        this.select.closedStream
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.filterBar?.onClosePipe.next(this.data));
    }

    /** @docs-private */
    onSelect(item: KbqSelectValue[]) {
        if (this.selectionAllInProgress) return;

        if (this.selectedAllEqualsSelectedNothing && this.allVisibleOptionsSelected) {
            this.data.value = [];
        } else {
            this.data.value = item;
        }

        this.emitChangePipeEvent();

        this.stateChanges.next();
    }

    /** @docs-private */
    onClear() {
        this.data.value = [];

        this.updateInternalSelected();

        this.filterBar?.onClearPipe.emit(this.data);
        this.filterBar?.onChangePipe.emit(this.data);
        this.stateChanges.next();
    }

    /** @docs-private */
    toggleSelectionAllByEnterKey() {
        if (this.data.selectAll && this.select.keyManager.activeItemIndex === 0) {
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
            this.data.value = [...this.select.value];
        }

        if (emitEvent) {
            this.emitChangePipeEvent();
        }

        this.stateChanges.next();
    }

    /** Comparator of selected options */
    compareByValue = (o1: any, o2: any): boolean => o1?.id === o2?.id;

    /** handler for select all options in select */
    selectAllHandler = (event: KeyboardEvent) => {
        event.preventDefault();

        this.toggleSelectionAll();
    };

    /** @docs-private */
    onClose() {
        if (this.allOptionsSelected) {
            this.updateInternalSelected();
        }
    }

    /** opens select */
    override open() {
        this.select.open();
    }

    private updateInternalSelected() {
        if (this.selectedAllEqualsSelectedNothing) {
            this.internalSelected = this.data.value?.slice() || [];
        }
    }

    private emitChangePipeEvent() {
        if (this.selectedAllEqualsSelectedNothing && this.allOptionsSelected) {
            this.filterBar?.onChangePipe.emit({ ...this.data, value: [] });
        } else {
            this.filterBar?.onChangePipe.emit(this.data);
        }
    }

    private getFilteredOptions = (): KbqSelectValue[] => {
        return this.searchControl.value
            ? this.values.filter((item) => item.name.toLowerCase().includes(this.searchControl.value.toLowerCase()))
            : this.values;
    };
}
