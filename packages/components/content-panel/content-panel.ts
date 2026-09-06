import { animate, state, style, transition, trigger } from '@angular/animations';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
    inject,
    input,
    linkedSignal,
    numberAttribute,
    OnInit,
    output,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import {
    KbqAnimationCurves,
    KbqAnimationDurations,
    KbqComponentColors,
    kbqInjectA11yLocaleConfiguration,
    KbqOverflowShadowContainer,
    KbqStateSaving
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqResizable, KbqResizer, KbqResizerSizeChangeEvent } from '@koobiq/components/resizer';
import { KbqScrollbar } from '@koobiq/components/scrollbar';
import { SizeL } from '@koobiq/design-tokens';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

const KBQ_CONTENT_PANEL_CONTAINER_CONTENT_ANIMATION = trigger('contentAnimation', [
    state('false', style({ 'margin-right': 0 })),
    state('true', style({ 'margin-right': '{{ marginRight }}px' }), { params: { marginRight: 0 } }),
    transition('true => false', [animate(`${KbqAnimationDurations.Entering} ${KbqAnimationCurves.AccelerationCurve}`)]),
    transition('false => true', [animate(`${KbqAnimationDurations.Exiting} ${KbqAnimationCurves.DecelerationCurve}`)])
]);

const KBQ_CONTENT_PANEL_CONTAINER_PANEL_ANIMATION = trigger('panelAnimation', [
    transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate(
            `${KbqAnimationDurations.Entering} ${KbqAnimationCurves.DecelerationCurve}`,
            style({ transform: 'translateX(0%)' })
        )
    ]),
    transition(':leave', [
        animate(
            `${KbqAnimationDurations.Exiting} ${KbqAnimationCurves.AccelerationCurve}`,
            style({ transform: 'translateX(100%)' })
        )
    ])
]);

@Component({
    selector: 'kbq-content-panel-aside',
    template: `
        <ng-content />
    `,
    styleUrl: './content-panel-aside.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-content-panel-aside'
    },
    exportAs: 'kbqContentPanelAside'
})
export class KbqContentPanelAside {}

@Directive({
    selector: '[kbqContentPanelHeaderTitle]',
    host: {
        class: 'kbq-content-panel-header-title'
    },
    exportAs: 'kbqContentPanelHeaderTitle'
})
export class KbqContentPanelHeaderTitle {}

@Directive({
    selector: '[kbqContentPanelHeaderActions]',
    host: {
        class: 'kbq-content-panel-header-actions'
    },
    exportAs: 'kbqContentPanelHeaderActions'
})
export class KbqContentPanelHeaderActions {}

@Component({
    selector: 'kbq-content-panel-header',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <div class="kbq-content-panel-header__wrapper">
            <ng-content select="[kbqContentPanelHeaderTitle]" />
            <div class="kbq-content-panel-header__actions">
                <ng-content select="[kbqContentPanelHeaderActions]" />
                @if (!contentPanelContainer.disableClose()) {
                    <button
                        class="kbq-content-panel-header__close-button"
                        kbq-button
                        type="button"
                        [attr.aria-label]="a11yLocaleConfiguration().close"
                        [color]="componentColors.Contrast"
                        [kbqStyle]="buttonStyles.Transparent"
                        (click)="contentPanelContainer.close()"
                    >
                        <i kbq-icon="kbq-xmark_16"></i>
                    </button>
                }
            </div>
        </div>
        <ng-content />
    `,
    styleUrl: './content-panel-header.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-content-panel-header',
        '[style.box-shadow]':
            'contentPanel.bodyOverflow().top ? "var(--kbq-content-panel-header-overflow-box-shadow)" : null'
    }
})
export class KbqContentPanelHeader {
    /**
     * @docs-private
     */
    protected readonly contentPanelContainer = inject(KbqContentPanelContainer);
    /** @docs-private */
    protected readonly contentPanel = inject(KbqContentPanel);
    /**
     * @docs-private
     */
    protected readonly buttonStyles = KbqButtonStyles;
    /**
     * @docs-private
     */
    protected readonly componentColors = KbqComponentColors;
    /** Accessible name for the icon-only close button. */
    protected readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();
}

@Component({
    selector: 'kbq-content-panel-body',
    imports: [KbqScrollbar, KbqOverflowShadowContainer],
    template: `
        <kbq-scrollbar #overflowContainer="kbqOverflowShadowContainer" kbqOverflowShadowContainer>
            <div class="kbq-content-panel-body__content">
                <ng-content />
            </div>
        </kbq-scrollbar>
    `,
    styleUrl: './content-panel-body.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-content-panel-body'
    },
    exportAs: 'kbqContentPanelBody'
})
export class KbqContentPanelBody {
    /** @docs-private */
    readonly scrollbar = viewChild.required(KbqScrollbar);
    /** @docs-private */
    readonly overflowContainer = viewChild.required(KbqOverflowShadowContainer);
}

@Component({
    selector: 'kbq-content-panel-footer',
    template: `
        <ng-content />
    `,
    styleUrl: './content-panel-footer.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-content-panel-footer',
        '[style.box-shadow]':
            'contentPanel.bodyOverflow().bottom ? "var(--kbq-content-panel-footer-overflow-box-shadow)" : null'
    }
})
export class KbqContentPanelFooter {
    /** @docs-private */
    protected readonly contentPanel = inject(KbqContentPanel);
}

@Component({
    selector: 'kbq-content-panel',
    template: `
        <ng-content select="kbq-content-panel-aside" />
        <div class="kbq-content-panel__content">
            <ng-content select="kbq-content-panel-header" />
            <ng-content select="kbq-content-panel-body" />
            <ng-content select="kbq-content-panel-footer" />
        </div>
    `,
    styleUrls: [
        './content-panel-tokens.scss',
        './content-panel.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-content-panel'
    }
})
export class KbqContentPanel {
    private readonly contentPanelBody = contentChild(KbqContentPanelBody);

    /**
     * Current body overflow state. Read by the header and footer to render their `box-shadow`.
     * @docs-private
     */
    readonly bodyOverflow = computed(
        () => this.contentPanelBody()?.overflowContainer().overflow() ?? { top: false, bottom: false }
    );
}

/** How long a resize has to settle before the width is written. */
const resizeWriteDebounce = 300;

/** The persisted state of a content panel — whether it was open, and how wide it was dragged. */
export interface KbqContentPanelState {
    opened: boolean;
    width: number;
}

/**
 * Coerces a raw persisted payload into a `KbqContentPanelState`, returning `null` for anything
 * unrecognizable.
 *
 * Web storage is origin-wide and user-writable, so a payload is never trusted — without this, an entry
 * such as `{"width": "wide"}` would reach the inline `width` style and collapse the panel.
 */
const normalizeContentPanelState = (parsed: unknown): KbqContentPanelState | null => {
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    const { opened, width } = parsed as Partial<KbqContentPanelState>;

    if (typeof opened !== 'boolean' || typeof width !== 'number' || !Number.isFinite(width)) return null;

    return { opened, width };
};

@Component({
    selector: 'kbq-content-panel-container',
    imports: [KbqResizable, KbqResizer, KbqScrollbar],
    template: `
        <kbq-scrollbar [@contentAnimation]="contentAnimationState()">
            <div class="kbq-content-panel-container__content">
                <ng-content />
            </div>
        </kbq-scrollbar>
        @if (openedState()) {
            <div
                @panelAnimation
                class="kbq-content-panel-container__panel"
                kbqResizable
                [style.min-width.px]="minWidth()"
                [style.width.px]="widthState()"
                [style.max-width.px]="maxWidth()"
            >
                @if (!disableResizer()) {
                    <div
                        class="kbq-content-panel-container__panel-resizer"
                        [kbqResizer]="[-1, 0]"
                        (sizeChange)="handleResizerSizeChange($event)"
                        (dblclick)="handleResizerDBLClick($event)"
                    ></div>
                }
                <ng-content select="kbq-content-panel" />
            </div>
        }
    `,
    styleUrl: './content-panel-container.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-content-panel-container',
        '[class.kbq-content-panel-container__opened]': 'openedState()',
        '(keydown.escape)': 'handleEscapeKeydown($event)'
    },
    // `useStateSaving` and `stateSavingKey` are the directive's inputs, surfaced on the container.
    hostDirectives: [
        { directive: KbqStateSaving, inputs: ['useStateSaving', 'stateSavingKey'] }
    ],
    animations: [
        KBQ_CONTENT_PANEL_CONTAINER_CONTENT_ANIMATION,
        KBQ_CONTENT_PANEL_CONTAINER_PANEL_ANIMATION
    ],
    exportAs: 'kbqContentPanelContainer'
})
export class KbqContentPanelContainer implements OnInit {
    /**
     * Persistence of the opened state and width, applied as a host directive. `useStateSaving` and
     * `stateSavingKey` are its inputs, surfaced on the container.
     */
    private readonly stateSaving = inject(KbqStateSaving);

    /**
     * Whether the content panel is opened.
     *
     * Bound through the `opened` attribute. Unset it is `undefined` rather than `false`, which is how the
     * container tells an application that drives the panel from one that leaves it to remember its own
     * state. Read {@link isOpened} for the state itself.
     *
     * @default undefined
     */
    readonly openedInput = input(undefined, {
        alias: 'opened',
        transform: (value: unknown): boolean | undefined => (value == null ? undefined : booleanAttribute(value))
    });

    /**
     * Emits event when the content panel opened state is changed.
     */
    readonly openedChange = output<boolean>();

    /**
     * Whether the content panel can not be closed by clicking on the close button or pressing the ESCAPE key.
     *
     * @default false
     */
    readonly disableClose = input(false, { transform: booleanAttribute });

    /**
     * Whether the content panel can not be closed by pressing the ESCAPE key.
     */
    readonly disableCloseByEscape = input(this.disableClose(), { transform: booleanAttribute });

    /**
     * Whether the content panel resizer is disabled.
     */
    readonly disableResizer = input(false, { transform: booleanAttribute });

    /**
     * Minimum width of the `KbqContentPanel`.
     *
     * @default 480
     */
    readonly minWidth = input(480, { transform: numberAttribute });

    /**
     * Width of the `KbqContentPanel`.
     *
     * @default 640
     */
    readonly width = input(640, { transform: numberAttribute });

    /**
     * Max width of the `KbqContentPanel`.
     *
     * @default 800
     */
    readonly maxWidth = input(800, { transform: numberAttribute });

    /**
     * A linked signal rather than a plain one: it follows the input whenever the input changes, and keeps
     * a local write until then — which is what lets a restored state survive the input's initial value.
     * @docs-private
     */
    protected readonly openedState = linkedSignal(() => this.openedInput() ?? false);

    /**
     * @docs-private
     */
    protected readonly widthState = linkedSignal(() => this.width());

    /**
     * Whether the content panel is opened.
     */
    readonly isOpened = computed(() => this.openedState());

    /**
     * @docs-private
     */
    protected readonly contentAnimationState = computed(() => {
        return {
            value: this.openedState(),
            params: { marginRight: this.widthState() + (parseInt(SizeL) || 16) }
        };
    });

    /**
     * Resizing reports on every pointer move, so the width is written once the drag settles rather than
     * on each frame. The store's unchanged-payload skip does not help here — every frame is a new number.
     */
    private readonly resized = new Subject<void>();

    constructor() {
        this.resized.pipe(debounceTime(resizeWriteDebounce), takeUntilDestroyed()).subscribe(() => {
            this.saveState();
        });
    }

    ngOnInit(): void {
        if (!this.persists) return;

        const savedState = this.stateSaving.read(normalizeContentPanelState);

        if (!savedState) return;

        this.stateSaving.applying(() => {
            // A bound `[opened]` owns the opened state, so only the width is restored there. `[width]` is
            // not ownership in the same way: there is no `widthChange`, so a drag never reaches the
            // application and the input is the starting width rather than the current one.
            if (this.openedInput() === undefined) {
                this.openedState.set(savedState.opened);
            }

            this.widthState.set(this.clampWidth(savedState.width));
        });
    }

    /**
     * Persists whether the panel is open and how wide it is.
     *
     * Called whenever the panel is opened, closed or resized.
     */
    saveState(): void {
        if (!this.persists) return;

        this.stateSaving.write({ opened: this.openedState(), width: this.widthState() });
    }

    /**
     * Removes the state persisted for this panel.
     *
     * Persistence itself stays on — the next change is written again. Unset `useStateSaving` to stop it.
     */
    clearSavedState(): void {
        this.stateSaving.clear();
    }

    /**
     * Whether state is currently persisted for this panel — restored on init, or written since.
     * Always `false` while `useStateSaving` is unset, and `false` again after `clearSavedState()`.
     */
    get hasSavedState(): boolean {
        return this.stateSaving.state != null;
    }

    /**
     * Toggles the content panel opened state.
     */
    toggle(): void {
        this.openedState.update((state) => !state);
        this.openedChange.emit(this.openedState());
        this.saveState();
    }

    /**
     * Opens the content panel.
     */
    open(): void {
        if (this.openedState()) return;

        this.openedState.set(true);
        this.openedChange.emit(this.openedState());
        this.saveState();
    }

    /**
     * Closes the content panel.
     */
    close(): void {
        if (!this.openedState()) return;

        this.openedState.set(false);
        this.openedChange.emit(this.openedState());
        this.saveState();
    }

    /**
     * @docs-private
     */
    protected handleResizerDBLClick(event: MouseEvent): void {
        event.preventDefault();

        this.widthState.set(this.width());

        // Persisted straight away rather than through the debounce: a reset is a single deliberate act,
        // and leaving the dragged width stored would bring it back on the next visit.
        this.saveState();
    }

    /**
     * @docs-private
     */
    protected handleResizerSizeChange({ width }: KbqResizerSizeChangeEvent): void {
        this.widthState.set(this.clampWidth(width));

        this.resized.next();
    }

    /** Whether this panel reads and writes its state at all. */
    private get persists(): boolean {
        // A panel that is not in the document has no stable key — the default resolver derives one from
        // the path to `<body>` — which is the ordinary state of one projected into an overlay.
        return this.stateSaving.useStateSaving() && !!this.stateSaving.host?.isConnected;
    }

    /** Holds a width inside the configured bounds, which can differ from the ones a state was saved under. */
    private clampWidth(width: number): number {
        if (width > this.maxWidth()) return this.maxWidth();
        if (width < this.minWidth()) return this.minWidth();

        return width;
    }

    /**
     * @docs-private
     */
    protected handleEscapeKeydown(event: KeyboardEvent): void {
        if (!this.openedState() || this.disableClose() || this.disableCloseByEscape()) return;

        event.preventDefault();
        event.stopPropagation();

        this.close();
    }
}
