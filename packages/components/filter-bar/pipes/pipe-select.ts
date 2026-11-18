import { NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
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
import { kbqFilterSelectValueNameKey, kbqFilterSelectValuesBySearch } from './select-pipe-search';

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

        return kbqFilterSelectValuesBySearch(
            this.values,
            this.searchQuery(),
            !this.isTemplateRef(this.valueTemplate),
            (value) => this.optionName(value)
        );
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

    /**
     * Resolved display name of an option in the panel and in the search. Only the option's own `nameKey`
     * applies: the id lookup is meaningful solely for a committed value in the trigger, and running it here
     * would scan the whole option list once per option per change detection.
     */
    protected optionName(item: KbqSelectValue): string {
        return this.resolveName(item, 'select-option');
    }

    /**
     * Selected values the trigger shows. Normally the values behind `select.triggerValues`; when the
     * committed value carries its own `nameKey`, the committed value is returned instead so a restored
     * keyed value stays visible even when no current option matches it.
     */
    protected displayValues(select: KbqSelect): KbqSelectValue[] {
        const committed = this.data.value;

        if (committed?.nameKey) return [committed];

        return select.triggerValues.map((option) => option.value as KbqSelectValue);
    }

    /** Text of the trigger and tooltip for the single selected value. */
    protected displayValue(select: KbqSelect): string {
        const value = this.displayValues(select)[0];

        if (!value) return '';

        // Without a key the trigger keeps its existing behavior — including a custom template's text.
        const nameKey = kbqFilterSelectValueNameKey(value, this.values);

        return nameKey ? this.resolveName(value, 'select-option', nameKey) : select.triggerValue;
    }

    /** Comparator of selected options */
    compareByValue = (o1: Pick<KbqSelectValue, 'id'> | null, o2: Pick<KbqSelectValue, 'id'> | null): boolean =>
        !!o1 && !!o2 && o1.id === o2.id;

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
