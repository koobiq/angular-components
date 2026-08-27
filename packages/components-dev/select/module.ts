import { ListRange } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
// import { AsyncPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
    signal,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KBQ_CONNECTED_OVERLAY_ABOVE_CLASS,
    KBQ_CONNECTED_OVERLAY_OVERLAP_CLASS,
    KBQ_WINDOW,
    KbqHighlightModule
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectChange, KbqSelectModule, kbqSelectOptionsProvider } from '@koobiq/components/select';
import { KbqTagsModule } from '@koobiq/components/tags';
import { SelectExamplesModule } from 'packages/docs-examples/components/select';
import { merge, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DevThemeToggle } from '../theme-toggle';
import { DEV_OPTIONS } from './mock';

@Component({
    selector: 'dev-examples',
    imports: [SelectExamplesModule],
    template: `
        <select-select-all-example />
        <hr />

        <select-select-all-label-example />
        <hr />

        <select-custom-tag-content-example />
        <hr />

        <select-auto-hide-scroll-strategy-example />
        <hr />

        <select-preselected-values-example />
        <hr />

        <select-two-line-option-example />
        <hr />

        <select-paging-error-example />
        <hr />

        <select-paging-example />
        <hr />

        <select-loading-error-custom-example />
        <hr />

        <select-add-new-option-example />
        <hr />

        <select-no-variants-example />
        <hr />

        <select-loading-example />
        <hr />

        <select-loading-error-example />
        <hr />

        <select-scrolling-and-layering-example />
        <hr />

        <select-with-multiline-matcher-example />
        <hr />

        <select-with-panel-width-default-example />
        <hr />

        <select-with-panel-width-auto-example />
        <hr />

        <select-with-panel-width-fixed-example />
        <hr />

        <select-with-panel-min-width-example />
        <hr />

        <select-virtual-scroll-example />
        <hr />

        <select-validation-example />
        <hr />

        <select-search-example />
        <hr />

        <select-prioritized-selected-example />
        <hr />

        <select-overview-example />
        <hr />

        <select-multiple-example />
        <hr />

        <select-icon-example />
        <hr />

        <select-height-example />
        <hr />

        <select-groups-example />
        <hr />

        <select-cleaner-example />
        <hr />

        <select-disabled-example />
        <hr />

        <select-footer-example />
        <hr />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

/**
 * Playground for the first-row panel anchor.
 *
 * A multiline trigger grows a row per selected option. Once it is taller than the panel and the panel fits
 * on neither side of it, the panel is anchored below the trigger's first row and drawn over the rest. The
 * field is pinned to the viewport because that last condition is about screen position, not page layout —
 * slide it until neither side has room and watch the readout change.
 */
@Component({
    selector: 'dev-panel-anchor',
    imports: [KbqButtonModule, KbqSelectModule, ReactiveFormsModule],
    template: `
        <div class="dev-panel-anchor__controls">
            <p>
                Многострочное поле растёт с каждой выбранной опцией. Выберите столько, чтобы оно стало выше выпадающего
                списка, и подвиньте его так, чтобы список не помещался ни под ним, ни над ним: панель прижмётся к первой
                строке тегов и нарисуется поверх остальных.
            </p>

            <label>
                Отступ сверху: {{ top() }}px
                <input type="range" min="0" max="700" step="10" [value]="top()" (input)="setTop($event)" />
            </label>

            <label>
                Ширина поля: {{ fieldWidth() }}px
                <input
                    type="range"
                    min="120"
                    max="480"
                    step="10"
                    [value]="fieldWidth()"
                    (input)="setFieldWidth($event)"
                />
            </label>

            <div class="dev-panel-anchor__actions">
                <button kbq-button (click)="selectAll()">Выбрать все</button>
                <button kbq-button (click)="control.setValue([])">Очистить</button>
                <button kbq-button (click)="pinned.set(!pinned())">
                    {{ pinned() ? 'Вернуть в поток' : 'Закрепить на экране' }}
                </button>
            </div>

            <div>
                Панель:
                <b>{{ anchor() }}</b>
            </div>
        </div>

        <div
            class="dev-panel-anchor__field"
            [class.dev-panel-anchor__field_pinned]="pinned()"
            [style.top.px]="top()"
            [style.width.px]="fieldWidth()"
        >
            <kbq-form-field>
                <kbq-select placeholder="Опции" [formControl]="control" [multiline]="true" [multiple]="true">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>
    `,
    styles: `
        .dev-panel-anchor__controls {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xs);

            margin-bottom: var(--kbq-size-xl);
            padding: var(--kbq-size-l);

            border: 1px dashed;
        }

        .dev-panel-anchor__actions {
            display: flex;
            gap: var(--kbq-size-xs);
        }

        .dev-panel-anchor__field_pinned {
            position: fixed;
            left: var(--kbq-size-xxl);
            z-index: 1;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevPanelAnchor {
    private readonly window = inject(KBQ_WINDOW);

    /** Ten of these in a narrow field wrap onto ten rows, which is taller than the 256px panel. */
    readonly options = Array.from({ length: 10 }, (_, index) => `Опция ${index}`);
    readonly control = new UntypedFormControl(this.options);

    protected readonly top = signal(120);
    protected readonly fieldWidth = signal(180);
    protected readonly pinned = signal(true);
    protected readonly anchor = signal('закрыта');

    protected setTop(event: Event): void {
        this.top.set(Number((event.target as HTMLInputElement).value));
    }

    protected setFieldWidth(event: Event): void {
        this.fieldWidth.set(Number((event.target as HTMLInputElement).value));
    }

    protected selectAll(): void {
        this.control.setValue(this.options);
    }

    /**
     * Reports which of the three positions the overlay settled on, read from the class it applies for each.
     * Deferred because re-anchoring after a selection is asynchronous — the trigger has to regrow first.
     */
    protected readAnchor(): void {
        setTimeout(() => this.anchor.set(this.resolveAnchor()), 100);
    }

    private resolveAnchor(): string {
        const pane = this.window.document.querySelector('.cdk-overlay-pane');

        if (!pane) return 'закрыта';

        if (pane.classList.contains(KBQ_CONNECTED_OVERLAY_OVERLAP_CLASS)) return 'на первой строке, поверх поля';

        return pane.classList.contains(KBQ_CONNECTED_OVERLAY_ABOVE_CLASS) ? 'над полем' : 'под полем';
    }
}

@Component({
    selector: 'dev-app',
    imports: [
        // AsyncPipe,
        FormsModule,
        ScrollingModule,
        KbqButtonModule,
        KbqSelectModule,
        KbqHighlightModule,
        KbqInputModule,
        KbqIconModule,
        ReactiveFormsModule,
        KbqTagsModule,
        DevDocsExamples,
        DevPanelAnchor,
        DevThemeToggle
    ],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    providers: [
        kbqSelectOptionsProvider({
            // panelWidth: 200
        })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp implements OnInit {
    singleSelected = '';
    multipleSelected = ['Disabled', 'Normal', 'Hovered', 'Selected', 'Selected1'];
    multipleSelectedForCustomTagText = ['Normal', 'Hovered'];

    singleSelectedWithSearch = 'Moscow';
    multipleSelectedWithSearch = ['Dzerzhinsk', 'Pskov'];

    singleSelectFormControl = new UntypedFormControl('', Validators.required);

    multiSelectSelectFormControl = new UntypedFormControl([], Validators.pattern(/^w/));

    searchCtrl: UntypedFormControl = new UntypedFormControl();
    filteredOptions: Observable<string[]>;

    multipleSearchCtrl: UntypedFormControl = new UntypedFormControl();
    filteredMultipleOptions: Observable<string[]>;

    optionCounter = 0;

    options: string[] = DEV_OPTIONS.sort();
    selectedOptionsAsObject = [
        { id: 3, name: 'Anapa' },
        { id: 55, name: 'Lyubertsy' },
        { id: 114, name: 'Tomsk' }
    ];
    optionsObj: { id: number; name: string }[] = DEV_OPTIONS.sort().map((option, index) => {
        return { id: index, name: option, active: true };
    });

    initialRange: ListRange = { start: 0, end: 7 } as unknown as ListRange;

    selected = ['Almetyevsk', 'Yaroslavl'];

    readonly cdkVirtualScrollViewport = viewChild.required(CdkVirtualScrollViewport);

    ngOnInit(): void {
        this.filteredOptions = merge(
            of(DEV_OPTIONS),
            this.searchCtrl.valueChanges.pipe(map((value) => this.getFilteredOptions(value)))
        );

        this.filteredMultipleOptions = merge(
            of(DEV_OPTIONS),
            this.multipleSearchCtrl.valueChanges.pipe(map((value) => this.getFilteredOptions(value)))
        );
    }

    compareWithById = (o1: any, o2: any): boolean => o1 && o2 && o1.id === o2.id;

    openedChange(opened) {
        console.log('openedChange: ', opened);

        if (!opened) {
            this.cdkVirtualScrollViewport().setRenderedContentOffset(0);
            this.cdkVirtualScrollViewport().setRenderedRange(this.initialRange);
        }
    }

    onSelectionChange($event: KbqSelectChange) {
        console.log(`onSelectionChange: ${$event.value}`);
    }

    hiddenItemsTextFormatter(hiddenItemsText: string, hiddenItems: number): string {
        return `${hiddenItemsText} ${hiddenItems}`;
    }

    opened($event) {
        console.log('opened: ', $event);
    }

    closed($event) {
        console.log('closed: ', $event);
    }

    private getFilteredOptions(value): string[] {
        const searchFilter = value && value.new ? value.value : value;

        return searchFilter
            ? this.options.filter((option) => option.toLowerCase().includes(searchFilter.toLowerCase()))
            : this.options;
    }
}
