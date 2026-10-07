import { TemplatePortal } from '@angular/cdk/portal';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    inject,
    input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    TemplateRef,
    viewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {
    KBQ_CUSTOM_SCROLL_STRATEGY_PROVIDER,
    KBQ_SELECT_SCROLL_STRATEGY,
    KbqPopUpPlacementValues,
    PopUpPlacements
} from '@koobiq/components/core';
import { KBQ_DROPDOWN_SCROLL_STRATEGY } from '@koobiq/components/dropdown';
import { Subject } from 'rxjs';
import { KbqTabContent } from './tab-content.directive';
import { KBQ_TAB_LABEL, KbqTabLabel } from './tab-label.directive';

@Component({
    selector: 'kbq-tab',
    // Create a template for the content of the <kbq-tab> so that we can grab a reference to this
    // TemplateRef and use it in a Portal to render the tab content in the appropriate place in the
    // tab-group.
    template: '<ng-template><ng-content /></ng-template>',
    providers: [
        ...[KBQ_SELECT_SCROLL_STRATEGY, KBQ_DROPDOWN_SCROLL_STRATEGY].map((token) =>
            KBQ_CUSTOM_SCROLL_STRATEGY_PROVIDER(token, (overlay) => () => overlay.scrollStrategies.close())
        )
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    exportAs: 'kbqTab'
})
export class KbqTab implements OnInit, OnChanges, OnDestroy {
    private readonly viewContainerRef = inject(ViewContainerRef);

    /** @docs-private */
    get content(): TemplatePortal | null {
        return this.contentPortal;
    }

    private readonly templateLabelQuery = contentChild(KBQ_TAB_LABEL);

    /** The label template of the tab: the `kbqTabLabel` in its content, or else the one assigned in code. */
    get templateLabel(): KbqTabLabel {
        return this.templateLabelQuery() ?? this._templateLabel;
    }

    set templateLabel(value: KbqTabLabel) {
        this.setTemplateLabelInput(value);
    }

    private _templateLabel: KbqTabLabel;

    /**
     * Template provided in the tab content that will be used if present, used to enable lazy-loading
     */
    readonly explicitContent = contentChild(KbqTabContent, { read: TemplateRef });

    /** Template inside the KbqTab view that contains an `<ng-content>`. */
    readonly implicitContent = viewChild.required(TemplateRef);

    /** @docs-private */
    readonly tooltipTitleInput = input<string | undefined>(undefined, { alias: 'tooltipTitle' });

    /** @docs-private */
    readonly disabledInput = input<boolean | undefined, boolean | string | null | undefined>(undefined, {
        alias: 'disabled',
        transform: booleanAttribute
    });

    get tooltipTitle(): string {
        return this.overflowTooltipTitle + this._tooltipTitle;
    }

    set tooltipTitle(value: string) {
        this._tooltipTitle = value;
    }

    private _tooltipTitle = '';

    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this.disabled) {
            this._disabled = value;
        }
    }

    private _disabled: boolean = false;

    readonly tooltipPlacement = input<KbqPopUpPlacementValues>(PopUpPlacements.Right);

    /** Plain text label for the tab, used when there is no template label. */
    readonly textLabel = input('', { alias: 'label' });

    readonly empty = input<boolean, unknown>(false, { transform: booleanAttribute });

    readonly tabId = input<string>(undefined!);

    /** Whether the tab label contains only an icon (no text). */
    get iconOnlyLabel(): boolean {
        return this.templateLabel?.iconOnly() ?? false;
    }

    /** Emits whenever the internal state of the tab changes. */
    readonly stateChanges = new Subject<void>();

    /**
     * The relatively indexed position where 0 represents the center, negative is left, and positive
     * represents the right.
     */
    position: number | null = null;

    /**
     * The initial relatively index origin of the tab if it was created and selected after there
     * was already a selected tab. Provides context of what position the tab should originate from.
     */
    origin: number | null = null;

    /**
     * Whether the tab is currently active.
     */
    isActive = false;

    get isOverflown(): boolean {
        return !!this._overflowTooltipTitle;
    }

    get overflowTooltipTitle(): string {
        if (this.isOverflown) {
            return `${this._overflowTooltipTitle}\n`;
        }

        return '';
    }

    set overflowTooltipTitle(value: string) {
        this._overflowTooltipTitle = value;
    }

    private _overflowTooltipTitle = '';

    /** Portal that will be the hosted content of the tab */
    private contentPortal: TemplatePortal | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        // A bound input is handed to its member as the decorator input did; unbound, it leaves what code wrote.
        if (changes['tooltipTitleInput']) {
            const tooltipTitle = this.tooltipTitleInput();

            if (tooltipTitle !== undefined) this.tooltipTitle = tooltipTitle;
        }

        if (changes['disabledInput']) {
            const disabled = this.disabledInput();

            if (disabled !== undefined) this.disabled = disabled;
        }

        if (changes['textLabel'] || changes['disabledInput']) {
            this.stateChanges.next();
        }
    }

    ngOnInit(): void {
        this.contentPortal = new TemplatePortal(
            this.explicitContent() || this.implicitContent(),
            this.viewContainerRef
        );
    }

    ngOnDestroy(): void {
        this.stateChanges.complete();
    }

    /**
     * Keeps a label template assigned in code, used while the content of the tab has none. A falsy value is
     * ignored.
     * @docs-private
     */
    protected setTemplateLabelInput(value: KbqTabLabel) {
        if (value) {
            this._templateLabel = value;
        }
    }
}
