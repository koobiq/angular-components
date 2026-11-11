import { NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    isSignal,
    Signal,
    signal,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqHighlightModule, tokenizeSearchQuery } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';
import { KbqTitleModule } from '@koobiq/components/title';
import { startWith } from 'rxjs';
import { map } from 'rxjs/operators';
import { KbqSelectValue } from '../filter-bar.types';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';
import { kbqFilterSelectValueId, kbqFilterSelectValuesBySearch } from './select-pipe-search';

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
        ReactiveFormsModule,
        KbqHighlightModule
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

        return kbqFilterSelectValuesBySearch(this.values, this.searchQuery(), !this.isTemplateRef(this.valueTemplate));
    });

    /** @docs-private */
    readonly select = viewChild.required(KbqSelect);

    constructor() {
        super();

        this.filterBar?.internalTemplatesChanges
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.templatesVersion.update((version) => version + 1));
    }

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

    /** Comparator of selected options: by stable id, since a name can be a translation. */
    compareByValue = (o1: Pick<KbqSelectValue, 'id'> | null, o2: Pick<KbqSelectValue, 'id'> | null): boolean =>
        !!o1 && !!o2 && kbqFilterSelectValueId(o1) === kbqFilterSelectValueId(o2);

    /**
     * Text of the trigger and the tooltip. Resolved from the selected option, so a name signal marks
     * this view dirty and the text follows a translation. A custom `valueTemplate` owns the text for a
     * plain string name; a signal name shows the resolved name instead, because the template's rendered
     * text is not a reactive source a translation could update in the same pass.
     *
     * @docs-private
     */
    protected displayValue(select: KbqSelect): string {
        const name = select.triggerValues[0]?.value?.name;

        return this.isTemplateRef(this.valueTemplate) && !isSignal(name) ? select.triggerValue : this.resolveName(name);
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
