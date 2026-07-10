import { AsyncPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';
import { KbqTitleModule } from '@koobiq/components/title';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { KbqSelectValue } from '../filter-bar.types';
import { KbqBasePipe, KbqPipeMinWidth } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';
import { KbqPipeTitleDirective } from './pipe-title';

@Component({
    selector: 'kbq-pipe-select',
    imports: [
        KbqButtonModule,
        KbqDividerModule,
        KbqSelectModule,
        NgClass,
        KbqPipeState,
        KbqPipeButton,
        KbqTitleModule,
        KbqPipeTitleDirective,
        KbqPipeMinWidth,
        NgTemplateOutlet,
        KbqFormFieldModule,
        KbqIcon,
        KbqInputModule,
        ReactiveFormsModule,
        AsyncPipe
    ],
    templateUrl: 'pipe-select.html',
    styleUrls: ['base-pipe.scss', 'pipe-select.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ]
})
export class KbqPipeSelectComponent extends KbqBasePipe<KbqSelectValue> implements AfterViewInit, OnInit {
    /** control for search options */
    searchControl: UntypedFormControl = new UntypedFormControl();
    /** filtered by search options */
    filteredOptions: Observable<any[]>;

    /** @docs-private */
    @ViewChild(KbqSelect) select: KbqSelect;

    /** selected value */
    get selected() {
        return this.data.value;
    }

    /** Whether the current pipe is empty. */
    get isEmpty(): boolean {
        return !this.data.value;
    }

    /** @docs-private */
    ngOnInit(): void {
        // Merge the live template stream (re-emits when `pipeTemplates` changes after init) with the
        // search input, so options render on first open even when templates are supplied late
        // (e.g. a parent assigning `pipeTemplates` in ngAfterViewInit for a viewChild valueTemplate).
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

    onSelect(item: KbqSelectValue) {
        this.data.value = item;
        this.filterBar?.onChangePipe.emit(this.data);
        this.stateChanges.next();

        setTimeout(() => this.restoreTriggerFocus());
    }

    /** Comparator of selected options */
    compareByValue = (o1: any, o2: any): boolean => o1 && o2 && o1.id === o2.id;

    /** opens select */
    override open() {
        this.select.open();
    }

    private getFilteredOptions = (): KbqSelectValue[] => {
        const search = this.searchControl.value;

        return search
            ? this.values.filter((item: KbqSelectValue) => item.name.toLowerCase().includes(search.toLowerCase()))
            : this.values;
    };
}
