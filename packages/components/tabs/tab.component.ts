import { TemplatePortal } from '@angular/cdk/portal';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    TemplateRef,
    ViewChild,
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
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqTab',
    providers: [
        ...[KBQ_SELECT_SCROLL_STRATEGY, KBQ_DROPDOWN_SCROLL_STRATEGY].map((token) =>
            KBQ_CUSTOM_SCROLL_STRATEGY_PROVIDER(token, (overlay) => () => overlay.scrollStrategies.close())
        )
    ]
})
export class KbqTab implements OnInit, OnChanges, OnDestroy {
    /** @docs-private */
    get content(): TemplatePortal | null {
        return this.contentPortal;
    }

    @ContentChild(KBQ_TAB_LABEL)
    get templateLabel(): KbqTabLabel {
        return this._templateLabel;
    }

    set templateLabel(value: KbqTabLabel) {
        this.setTemplateLabelInput(value);
    }

    private _templateLabel: KbqTabLabel;

    /**
     * Template provided in the tab content that will be used if present, used to enable lazy-loading
     */
    @ContentChild(KbqTabContent, { read: TemplateRef, static: true }) explicitContent: TemplateRef<any>;

    /** Template inside the KbqTab view that contains an `<ng-content>`. */
    @ViewChild(TemplateRef, { static: true }) implicitContent: TemplateRef<any>;

    @Input()
    get tooltipTitle(): string {
        return this.overflowTooltipTitle + this._tooltipTitle;
    }

    set tooltipTitle(value: string) {
        this._tooltipTitle = value;
    }

    private _tooltipTitle = '';

    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this.disabled) {
            this._disabled = value;
        }
    }

    private _disabled: boolean = false;

    @Input() tooltipPlacement: KbqPopUpPlacementValues = PopUpPlacements.Right;

    /** Plain text label for the tab, used when there is no template label. */
    @Input('label') textLabel = '';

    @Input({ transform: booleanAttribute }) empty: boolean = false;

    @Input() tabId: string;

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

    constructor(private readonly viewContainerRef: ViewContainerRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty('textLabel') || changes.hasOwnProperty('disabled')) {
            this.stateChanges.next();
        }
    }

    ngOnInit(): void {
        this.contentPortal = new TemplatePortal(this.explicitContent || this.implicitContent, this.viewContainerRef);
    }

    ngOnDestroy(): void {
        this.stateChanges.complete();
    }

    /**
     * This has been extracted to a util because of TS 4 and VE.
     * View Engine doesn't support property rename inheritance.
     * TS 4.0 doesn't allow properties to override accessors or vice-versa.
     * @docs-private
     */
    protected setTemplateLabelInput(value: KbqTabLabel) {
        // Only update the templateLabel via query if there is actually
        // a KbqTabLabel found. This works around an issue where a user may have
        // manually set `templateLabel` during creation mode, which would then get clobbered
        // by `undefined` when this query resolves.
        if (value) {
            this._templateLabel = value;
        }
    }
}
