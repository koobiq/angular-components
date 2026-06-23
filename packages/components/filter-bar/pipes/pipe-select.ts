import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, viewChild, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';
import { KbqTitleModule } from '@koobiq/components/title';
import { merge, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { KbqSelectValue } from '../filter-bar.types';
import { KbqBasePipe, KbqPipeMinWidth } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';

@Component({
    selector: 'kbq-pipe-select',
    imports: [
        KbqButtonModule,
        KbqDividerModule,
        KbqSelectModule,
        KbqPipeState,
        KbqPipeButton,
        KbqTitleModule,
        KbqPipeMinWidth,
        NgTemplateOutlet,
        KbqIcon,
        KbqInputModule,
        ReactiveFormsModule,
        AsyncPipe
    ],
    templateUrl: 'pipe-select.html',
    styleUrls: ['base-pipe.scss', 'pipe-select.scss'],
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqPipeSelectComponent extends KbqBasePipe<KbqSelectValue> implements AfterViewInit, OnInit {
    /** control for search options */
    searchControl: UntypedFormControl = new UntypedFormControl();
    /** filtered by search options */
    filteredOptions: Observable<any[]>;

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

    /** @docs-private */
    ngOnInit(): void {
        this.filteredOptions = merge(
            of(this.values),
            this.searchControl.valueChanges.pipe(map((value) => this.getFilteredOptions(value)))
        );
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
    }

    /** Comparator of selected options */
    compareByValue = (o1: any, o2: any): boolean => o1 && o2 && o1.id === o2.id;

    /** opens select */
    override open() {
        this.select().open();
    }

    private getFilteredOptions(value: string): KbqSelectValue[] {
        return value
            ? this.values.filter((item) => item.name.toLowerCase().includes(value.toLowerCase()))
            : this.values;
    }
}
