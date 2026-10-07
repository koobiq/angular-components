import { CdkTrapFocus, FocusMonitor, FocusOrigin, InputModalityDetector } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    computed,
    createComponent,
    ElementRef,
    EnvironmentInjector,
    EventEmitter,
    inject,
    Injector,
    input,
    isDevMode,
    linkedSignal,
    model,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    signal,
    SimpleChanges,
    TemplateRef,
    Type,
    viewChild,
    viewChildren,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { KbqButtonColor, KbqButtonModule } from '@koobiq/components/button';
import {
    ENTER,
    ESCAPE,
    KBQ_A11Y_LOCALE_CONFIGURATION,
    KBQ_WINDOW,
    KbqComponentColors,
    KbqLocaleOverridesDirective,
    KbqOverflowShadowBottom,
    KbqOverflowShadowContainer,
    KbqOverflowShadowState,
    KbqOverflowShadowTop
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { KbqTitleModule } from '@koobiq/components/title';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CssUnitPipe } from './css-unit.pipe';
import { KbqModalControlService } from './modal-control.service';
import { KbqModalRef } from './modal-ref.class';
import {
    IModalButtonOptions,
    KBQ_MODAL,
    KBQ_MODAL_OPTIONS,
    KbqModalAutoFocus,
    MODAL_ANIMATE_DURATION,
    ModalOptions,
    ModalSize,
    ModalType,
    OnClickCallback
} from './modal.type';

/** Phase of the open/close animation the dialog is in, or `null` between phases. */
export type AnimationState = 'enter' | 'leave' | null;

/** Form a `kbqTitle`/`kbqCaption`/`kbqContent`/`kbqFooter` value took. */
type KbqModalSlotKind = 'template' | 'component' | 'buttons' | 'string' | 'none';

/**
 * Classifies a slot value once, so the template dispatches on a value instead of calling a type
 * guard per binding — and so the guards stay out of the component's published surface.
 */
function slotKind(value: unknown): KbqModalSlotKind {
    if (value instanceof TemplateRef) return 'template';
    if (value instanceof Type) return 'component';
    if (Array.isArray(value)) return value.length > 0 ? 'buttons' : 'none';
    if (typeof value === 'string') return value === '' ? 'none' : 'string';

    return 'none';
}

let uniqueIdCounter = 0;

@Component({
    selector: 'kbq-modal',
    imports: [
        CdkTrapFocus,
        KbqButtonModule,
        KbqIconModule,
        CssUnitPipe,
        NgTemplateOutlet,
        KbqScrollbarViewport,
        KbqOverflowShadowContainer,
        KbqOverflowShadowTop,
        KbqOverflowShadowBottom,
        KbqTitleModule
    ],
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.scss', 'modal-tokens.scss'],
    providers: [{ provide: KBQ_MODAL, useExisting: KbqModalComponent }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-modal',
        '(keydown)': 'onKeyDown($event)'
    },
    hostDirectives: [
        { directive: KbqLocaleOverridesDirective, inputs: ['kbqLocaleOverrides: localeOverrides'] }
    ]
})
// `ModalOptions` is the service's contract, not the component's shape: every option is a signal
// input here, so the two no longer match structurally and the dialog cannot declare it.
export class KbqModalComponent<T = any, R = any>
    extends KbqModalRef<T, R>
    implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
    private overlay = inject(Overlay);
    private renderer = inject(Renderer2);
    private environmentInjector = inject(EnvironmentInjector);
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private viewContainer = inject(ViewContainerRef);
    private modalControl = inject(KbqModalControlService);
    private changeDetector = inject(ChangeDetectorRef);
    private focusMonitor = inject(FocusMonitor);
    private readonly inputModalityDetector = inject(InputModalityDetector);
    private readonly injector = inject(Injector);
    private readonly window = inject(KBQ_WINDOW);

    /** Accessible name for the icon-only close button. */
    protected readonly a11yLocaleConfiguration = inject(KbqLocaleOverridesDirective, { self: true }).read(
        'a11y',
        KBQ_A11Y_LOCALE_CONFIGURATION
    );

    protected readonly document = inject<Document>(DOCUMENT);

    /**
     * Options `KbqModalService` passed in, or `null` on the declarative path. Every input below
     * takes its initial value from here: a service-created dialog carries no template bindings, so
     * an input it does not bind keeps that initial value for the dialog's whole life.
     */
    private readonly options = inject(KBQ_MODAL_OPTIONS, { optional: true }) as ModalOptions<T, R> | null;

    componentColors = KbqComponentColors;

    /** Layout the dialog renders. */
    readonly kbqModalType = input<ModalType>(this.options?.kbqModalType ?? 'default');

    /** The instance of component opened into the dialog. */
    readonly kbqComponent = input<Type<T> | undefined>(this.options?.kbqComponent);

    /** Body of the dialog: text, a template or a component class. Falls back to `<ng-content>`. */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    readonly kbqContent = input<string | TemplateRef<{}> | Type<T> | undefined>(this.options?.kbqContent);

    /** Footer of the dialog: text, a template, or the buttons to render. Default modal ONLY. */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    readonly kbqFooter = input<string | TemplateRef<{}> | IModalButtonOptions<T>[] | undefined>(
        this.options?.kbqFooter
    );

    /** Whether the dialog is shown. Two-way bindable as `[(kbqVisible)]`. */
    readonly kbqVisible = model<boolean>(this.options?.kbqVisible ?? false);

    /** Explicit width, overriding the one `kbqSize` implies. A number is read as pixels. */
    readonly kbqWidth = input<number | string | undefined>(this.options?.kbqWidth);
    /** Width preset. */
    readonly kbqSize = input<ModalSize>(this.options?.kbqSize ?? ModalSize.Medium);
    /** Extra class names for the full-screen wrapper around the dialog. */
    readonly kbqWrapClassName = input<string | undefined>(this.options?.kbqWrapClassName);
    /** Extra class names for the dialog element itself. */
    readonly kbqClassName = input<string | undefined>(this.options?.kbqClassName);
    /** Inline styles for the dialog element. */
    readonly kbqStyle = input<object | undefined>(this.options?.kbqStyle);

    /** Heading of the dialog. Also becomes its accessible name. */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    readonly kbqTitle = input<string | TemplateRef<{}> | undefined>(this.options?.kbqTitle);
    /** Secondary line under the heading. Also becomes the dialog's accessible description. */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    readonly kbqCaption = input<string | TemplateRef<{}> | undefined>(this.options?.kbqCaption);
    /** Whether <kbd>Escape</kbd> cancels the dialog. */
    readonly kbqCloseByESC = input(this.options?.kbqCloseByESC ?? true, { transform: booleanAttribute });

    /** Where focus lands when the dialog is shown. */
    readonly kbqAutoFocus = input<KbqModalAutoFocus>(this.options?.kbqAutoFocus ?? 'first-tabbable');

    /** Accessible name for a dialog rendered without `kbqTitle` — a confirm or a header-less dialog. */
    readonly kbqAriaLabel = input<string | undefined>(this.options?.kbqAriaLabel);

    /** Whether the header renders a close button. */
    readonly kbqClosable = input(this.options?.kbqClosable ?? true, { transform: booleanAttribute });

    /** Whether the page behind the dialog is dimmed. */
    readonly kbqMask = input(this.options?.kbqMask ?? true, { transform: booleanAttribute });

    /** Whether a click on the dim layer cancels the dialog. */
    readonly kbqMaskClosable = input(this.options?.kbqMaskClosable ?? false, { transform: booleanAttribute });

    /** Inline styles for the dim layer. */
    readonly kbqMaskStyle = input<object | undefined>(this.options?.kbqMaskStyle);
    /** Inline styles for the body element. */
    readonly kbqBodyStyle = input<object | undefined>(this.options?.kbqBodyStyle);

    // TODO These three are the one part of the component still on decorators, and `output()` is not
    // a drop-in: they also back the public `afterOpen`/`beforeClose`/`afterClose` observables, and
    // `OutputEmitterRef` has no `asObservable()`. Converting them silently breaks
    // `modalRef.afterClose` on the service path — `ModalBuilderForService` subscribes first to
    // dispose the overlay, so by the time the later listener runs the component is destroyed and
    // `outputToObservable` has already completed the stream, dropping the value. It also emits onto
    // a destroyed `OutputRef` (NG0953) when the opener dies mid-animation. Converting them means
    // first moving the source of truth to a `Subject` the dialog owns and completes, with the output
    // as its template-facing mirror, and taking the overlay teardown off this emitter — the shape
    // `sidepanel` and `actions-panel` already use.
    // Trigger when modal open(visible) after animations
    @Output() readonly kbqAfterOpen = new EventEmitter<void>();
    // Trigger when modal leave-animation over
    @Output() readonly kbqAfterClose = new EventEmitter<R | undefined>();
    /** Emitted before the modal begins its closing animation. */
    @Output() readonly kbqBeforeClose = new EventEmitter<R | undefined>();

    // --- Predefined OK & Cancel buttons
    /** Caption of the predefined OK button. The button is not rendered without it. */
    readonly kbqOkText = input<string | undefined>(this.options?.kbqOkText);
    /** Color of the predefined OK button. */
    readonly kbqOkType = input<KbqButtonColor>(this.options?.kbqOkType ?? KbqComponentColors.Contrast);

    /** Whether focus returns to the trigger when the dialog closes. */
    readonly kbqRestoreFocus = input(this.options?.kbqRestoreFocus ?? true, { transform: booleanAttribute });

    /** Whether the predefined OK button renders its progress state. */
    readonly kbqOkLoading = input(this.options?.kbqOkLoading ?? false, { transform: booleanAttribute });

    /**
     * Decision handler of the predefined OK button. Returning `false` — or a promise of `false` —
     * keeps the dialog open; anything else closes it. Receives the body component instance when the
     * body is a component.
     *
     * Bind this **or** `(kbqOnOk)`, never both: a handler decides the close itself, so the event has
     * nothing left to report and is not emitted. Binding both is reported in development mode.
     */
    readonly kbqOkClick = input<OnClickCallback<T> | undefined>(this.options?.kbqOkClick);

    /**
     * Emits when the predefined OK button is activated. A notification, not a decision — the dialog
     * closes either way. Bind `[kbqOkClick]` instead to decide whether it closes.
     */
    @Output() readonly kbqOnOk = new EventEmitter<T>();

    /** Caption of the predefined Cancel button. The button is not rendered without it. */
    readonly kbqCancelText = input<string | undefined>(this.options?.kbqCancelText);

    /** Whether the predefined Cancel button renders its progress state. */
    readonly kbqCancelLoading = input(this.options?.kbqCancelLoading ?? false, { transform: booleanAttribute });

    /**
     * Decision handler of the predefined Cancel button, the close button, <kbd>Escape</kbd> and the
     * dim layer. Returning `false` — or a promise of `false` — keeps the dialog open.
     *
     * Bind this **or** `(kbqOnCancel)`, never both — see `kbqOkClick`.
     */
    readonly kbqCancelClick = input<OnClickCallback<T> | undefined>(this.options?.kbqCancelClick);

    /**
     * Emits when the dialog is cancelled, by any of the controls `kbqCancelClick` covers. A
     * notification, not a decision. Bind `[kbqCancelClick]` instead to decide whether it closes.
     */
    @Output() readonly kbqOnCancel = new EventEmitter<T>();

    readonly modalContainer = viewChild.required<ElementRef>('modalContainer');
    readonly bodyContainer = viewChild.required('bodyContainer', { read: ViewContainerRef });
    // Both the scrollable wrap and the body of a predefined layout, so a query for one would flash
    // whichever comes first in the template rather than the one that overflows.
    private readonly scrollbarViewports = viewChildren(KbqScrollbarViewport);
    private readonly trapFocus = viewChild.required(CdkTrapFocus);

    private readonly uniqueId = uniqueIdCounter++;

    /** Id of the element that names the dialog. Rendered on the title of a composed modal too. */
    readonly titleId = `kbq-modal-title-${this.uniqueId}`;
    /** Id of the element that describes the dialog. Rendered on the caption of a composed modal too. */
    readonly captionId = `kbq-modal-caption-${this.uniqueId}`;

    /**
     * Scroll-shadow state published by `KbqModalBody` when the modal content is composed
     * manually (`kbq-modal-title`/`kbq-modal-body`/`kbq-modal-footer`), so the header/footer
     * can render matching shadows without a direct template reference between them.
     * @docs-private
     */
    readonly bodyOverflow = signal<KbqOverflowShadowState>({ top: false, bottom: false });

    // Observable alias for kbqAfterOpen
    get afterOpen(): Observable<void> {
        return this.kbqAfterOpen.asObservable();
    }

    /** Observable alias for `kbqBeforeClose` */
    get beforeClose(): Observable<R | undefined> {
        return this.kbqBeforeClose.asObservable();
    }

    // Observable alias for kbqAfterClose
    get afterClose(): Observable<R | undefined> {
        return this.kbqAfterClose.asObservable();
    }

    // Indicate whether this dialog should hidden
    get hidden(): boolean {
        return !this.kbqVisible() && !this.animationState;
    }

    /**
     * Footer buttons with their defaults filled in. `kbqFooter` reports what was bound; this is what
     * the template renders, so the input is never written back over.
     */
    protected readonly footer = computed(() => {
        const footer = this.kbqFooter();

        return Array.isArray(footer) ? this.formatModalButtons(footer) : footer;
    });

    /** @docs-private */
    protected readonly titleKind = computed(() => slotKind(this.kbqTitle()));
    /** @docs-private */
    protected readonly captionKind = computed(() => slotKind(this.kbqCaption()));
    /** @docs-private */
    protected readonly contentKind = computed(() => slotKind(this.kbqContent()));
    /** @docs-private */
    protected readonly footerKind = computed(() => slotKind(this.footer()));

    /** Whether the dialog renders a footer — a predefined button is enough, `kbqFooter` is not required. */
    protected get hasFooter(): boolean {
        return this.composedFooter || !!(this.kbqFooter() || this.kbqOkText() || this.kbqCancelText());
    }

    /** Id of the element naming the dialog, or `null` when there is no title to point at. */
    protected get ariaLabelledBy(): string | null {
        return this.hasTitle() ? this.titleId : null;
    }

    /** Accessible name for a dialog with no title. Never rendered next to `aria-labelledby`. */
    protected get ariaLabel(): string | null {
        return this.hasTitle() ? null : this.kbqAriaLabel() || null;
    }

    /** Id of the caption describing the dialog, or `null` when no caption is rendered. */
    protected get ariaDescribedBy(): string | null {
        return this.hasCaption() ? this.captionId : null;
    }

    /**
     * Whether this dialog is covered by another one. `aria-modal` only hides the page behind the
     * topmost dialog, so every dialog below it is taken out of the accessibility tree and the tab
     * order explicitly.
     */
    protected get inert(): boolean {
        const top = this.modalControl.topVisibleModal();

        return !!top && top !== this;
    }

    /** Phase of the open/close animation, which the class list and the hidden state follow. */
    private readonly animationPhase = signal<AnimationState>(null);

    /** Full set of classes for the dialog element. */
    protected readonly containerClasses = computed(() => {
        const phase = this.animationPhase();
        const classes = ['kbq-modal-container', this.kbqClassName(), `kbq-modal_${this.kbqSize()}`];

        if (phase) classes.push(`zoom-${phase}`, `zoom-${phase}-active`);

        return classes.filter(Boolean).join(' ');
    });

    /**
     * Phase of the dim layer's animation. Follows the dialog's own phase, except while
     * `KbqModalControlService` fades the layer of a covered dialog out on its own.
     */
    private readonly maskPhase = signal<AnimationState>(null);

    /**
     * Whether the dim layer is actually painted: the input, overridden while another dialog covers
     * this one. Seeded from the input so re-binding `[kbqMask]` still takes effect.
     *
     * The override exists because `KbqModalControlService` turns the layer of the dialogs underneath
     * a newly opened one off and back on. That orchestration belongs in the dialog, keyed on
     * `KbqModalControlService.topVisibleModal()` the way `inert` already is.
     */
    private readonly maskEnabled = linkedSignal(() => this.kbqMask());

    /** Classes for the dim layer. */
    protected readonly maskAnimationClasses = computed(() => {
        const phase = this.maskPhase();

        return phase ? `fade-${phase} fade-${phase}-active` : '';
    });

    /**
     * Progress state the predefined buttons actually render: the input, overridden while a handler's
     * returned promise is pending. Seeded from the input so re-binding it still takes effect.
     */
    private readonly okLoading = linkedSignal(() => this.kbqOkLoading());
    private readonly cancelLoading = linkedSignal(() => this.kbqCancelLoading());

    /** @docs-private */
    protected loading(triggerType: 'ok' | 'cancel'): boolean {
        return triggerType === 'ok' ? this.okLoading() : this.cancelLoading();
    }

    private focusedElementBeforeOpen: HTMLElement | null;

    private previouslyFocusedElementOrigin: FocusOrigin;

    private monitoredContainer: ElementRef | null = null;
    private focusMonitorSubscription: Subscription | null = null;

    /** Whether a `kbq-modal-title` is composed inside the dialog body. */
    private composedTitle = false;

    /** Whether a `kbq-modal-caption` is composed inside the dialog body. */
    private composedCaption = false;

    /** Whether a `kbq-modal-footer` is composed inside the dialog body. */
    private composedFooter = false;

    private viewInitialized = false;

    /** Visibility the open/close flow has already run for. See `syncVisibleState`. */
    private handledVisible = false;

    // Handle the reference when using kbqContent as Component
    private contentComponentRef: ComponentRef<T>;
    // Current animation state
    private animationState: AnimationState;
    private container: HTMLElement | OverlayRef;

    /** Element or overlay the dialog is rendered into. Read once, on init. */
    readonly kbqGetContainer = input<HTMLElement | OverlayRef | (() => HTMLElement | OverlayRef) | null>(
        // A service-created dialog is already inside an overlay the builder owns, so it must not
        // create one of its own; the declarative path has nowhere to render until it does.
        this.options ? (this.options.kbqGetContainer ?? null) : () => this.overlay.create()
    );

    // [NOTE] NOT available when using by service!
    // Because ngOnChanges never be called when using by service,
    // here we can't support "kbqContent"(Component) etc. as inputs that initialized dynamically.
    // BUT: User also can change "kbqContent" dynamically to trigger UI changes
    // (provided you don't use Component that needs initializations)
    ngOnChanges(changes: SimpleChanges) {
        // A `model()` reports a write from inside through `ngOnChanges` as well, and that write has
        // already run the flow, so the guard inside is what keeps it from running twice.
        if (changes.kbqVisible) this.syncVisibleState(changes.kbqVisible.firstChange);
    }

    ngOnInit() {
        const content = this.kbqContent();
        const component = this.kbqComponent();

        // Create component along without View
        if (slotKind(content) === 'component') {
            this.createDynamicComponent(content as Type<T>);
        }

        if (component) {
            this.createDynamicComponent(component);
        }

        // Place the modal dom to elsewhere
        const container = this.kbqGetContainer();

        this.container = (typeof container === 'function' ? container() : container) as HTMLElement | OverlayRef;

        if (this.container instanceof HTMLElement) {
            this.container.appendChild(this.elementRef.nativeElement);
        } else if (this.container instanceof OverlayRef) {
            // The marker the outside-click filters of other overlays (e.g. `kbq-select`) key off.
            this.container.hostElement.classList.add('kbq-modal-overlay');
            // NOTE: only attach the dom to overlay, the view container is not changed actually
            this.container.overlayElement.appendChild(this.elementRef.nativeElement);
        }

        // Register modal when afterOpen/afterClose is stable
        this.modalControl.registerModal(this);
    }

    ngAfterViewInit() {
        // If using Component, it is the time to attach View while bodyContainer is ready
        if (this.contentComponentRef) {
            // In the custom layout the component's host element is inserted straight into
            // `.kbq-modal-content`, so it sits between the dialog and the header, body and footer it
            // composes. The dialog's column layout has to carry through it or the body never
            // becomes the part that gives way.
            if (this.isModalType('custom')) {
                (this.contentComponentRef.location.nativeElement as HTMLElement).classList.add(
                    'kbq-modal-content-host'
                );
            }

            this.bodyContainer().insert(this.contentComponentRef.hostView);
        }

        this.viewInitialized = true;

        if (this.kbqVisible()) {
            this.monitorContainer();
            this.focusInitialElement();
        }
    }

    ngOnDestroy() {
        // Created in `ngOnInit` but owned by `bodyContainer` only from `ngAfterViewInit`, so a modal
        // closed in between would leak it. Destroying an already-destroyed view is a no-op.
        this.contentComponentRef?.destroy();

        this.focusMonitorSubscription?.unsubscribe();

        if (this.monitoredContainer) {
            this.focusMonitor.stopMonitoring(this.monitoredContainer);
            this.monitoredContainer = null;
        }

        // Release everything the dialog holds globally even when it is torn down while still open:
        // the registry entry, the place in the stack and the body scroll lock.
        this.modalControl.deregisterModal(this);
        this.changeBodyOverflow();

        if (this.container instanceof OverlayRef) {
            this.container.dispose();
        }
    }

    open() {
        this.changeVisibleFromInside(true);
    }

    /**
     * Starts the closing animation and resolves the `afterClose` contract with `result`.
     *
     * Closing an already closed dialog is a no-op: `afterClose` emits once per actual transition.
     */
    close(result?: R) {
        this.changeVisibleFromInside(false, result);
    }

    // Destroy equals Close
    destroy(result?: R) {
        this.close(result);
    }

    markForCheck() {
        this.changeDetector.markForCheck();
    }

    triggerOk() {
        this.onClickOkCancel('ok');
    }

    triggerCancel() {
        this.onClickOkCancel('cancel');
    }

    getInstance(): KbqModalComponent {
        return this;
    }

    getContentComponentRef(): ComponentRef<T> {
        return this.contentComponentRef;
    }

    getContentComponent(): T {
        return this.contentComponentRef && this.contentComponentRef.instance;
    }

    getElement(): HTMLElement {
        return this.elementRef && this.elementRef.nativeElement;
    }

    /** Announces that a `kbq-modal-title` is composed inside the dialog. @docs-private */
    registerTitle(): void {
        this.composedTitle = true;
    }

    /** Announces that a `kbq-modal-caption` is composed inside the dialog. @docs-private */
    registerCaption(): void {
        this.composedCaption = true;
    }

    /** Announces that a `kbq-modal-footer` is composed inside the dialog. @docs-private */
    registerFooter(): void {
        this.composedFooter = true;
    }

    /** Publishes the composed body's scroll-shadow state. @docs-private */
    setBodyOverflow(state: KbqOverflowShadowState): void {
        this.bodyOverflow.set(state);
    }

    /**
     * Drives the dim layer's animation on its own, which is what lets `KbqModalControlService` fade
     * out the layer of a dialog another one has covered.
     * @docs-private
     */
    animateMaskTo(state: AnimationState): void {
        this.maskPhase.set(state);
    }

    /**
     * Turns the dim layer off or back on without touching `kbqMask`, so a dialog covered by another
     * one stops painting its own layer. See `maskEnabled`.
     * @docs-private
     */
    setMaskEnabled(enabled: boolean): void {
        this.maskEnabled.set(enabled);
    }

    /** @docs-private */
    protected isMaskEnabled(): boolean {
        return this.maskEnabled();
    }

    // AoT
    onClickCloseBtn() {
        if (this.kbqVisible()) {
            this.onClickOkCancel('cancel');
        }
    }

    /** @docs-private */
    protected onClickMask($event: MouseEvent) {
        // Only the primary button closes the modal: the sidepanel's backdrop is driven by `click`, which
        // never fires for the right or middle button, and `mousedown` here would otherwise diverge from it.
        if ($event.button !== 0) return;

        if (
            this.kbqMask() &&
            this.kbqMaskClosable() &&
            ($event.target as HTMLElement).classList.contains('kbq-modal-wrap') &&
            this.kbqVisible()
        ) {
            this.onClickOkCancel('cancel');
        }
    }

    /** @docs-private */
    protected isModalType(type: ModalType): boolean {
        return this.kbqModalType() === type;
    }

    /** @docs-private */
    protected onKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === ESCAPE) {
            // One implementation for both entry paths: the event only reaches the host from inside
            // the dialog, so it cannot be the keystroke that opened it. Escape is the Cancel
            // button, veto included.
            if (this.kbqCloseByESC() && this.kbqVisible()) {
                this.onClickOkCancel('cancel');
                event.preventDefault();
            }

            return;
        }

        if (event.ctrlKey && event.keyCode === ENTER) {
            if (this.kbqModalType() === 'confirm') {
                this.triggerOk();
            }

            (this.getElement().querySelector('[kbq-modal-main-action]') as HTMLElement)?.click();

            event.preventDefault();
        }
    }

    // AoT
    /** @docs-private */
    protected onClickOkCancel(type: 'ok' | 'cancel') {
        this.handleCloseResult(type, (doClose) => doClose !== false);
    }

    /** @docs-private */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    protected handleCloseResult(triggerType: 'ok' | 'cancel', canClose: (doClose: boolean | void | {}) => boolean) {
        const handler = triggerType === 'ok' ? this.kbqOkClick() : this.kbqCancelClick();
        const emitter = triggerType === 'ok' ? this.kbqOnOk : this.kbqOnCancel;
        const loading = triggerType === 'ok' ? this.okLoading : this.cancelLoading;
        // Users can return "false" to prevent closing by default
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        const caseClose = (doClose: boolean | void | {}) => canClose(doClose) && this.close(doClose as R);

        if (!handler) {
            emitter.emit(this.getContentComponent());
            caseClose(undefined);

            return;
        }

        if (isDevMode() && emitter.observed) {
            const input = triggerType === 'ok' ? 'kbqOkClick' : 'kbqCancelClick';
            const output = triggerType === 'ok' ? 'kbqOnOk' : 'kbqOnCancel';

            // eslint-disable-next-line no-console
            console.warn(
                `KbqModal: both [${input}] and (${output}) are bound. The handler decides the close, ` +
                    `so (${output}) is never emitted. Bind one of them.`
            );
        }

        const result = handler(this.getContentComponent());

        if (isPromise(result)) {
            loading.set(true);

            // eslint-disable-next-line @typescript-eslint/no-empty-object-type
            const handleThen = (doClose: boolean | void | {}) => {
                loading.set(false);
                caseClose(doClose);
            };

            (result as Promise<void>).then(handleThen).catch(handleThen);
        } else {
            caseClose(result);
        }
    }

    // Lookup a button's property, if the prop is a function, call & then return the result, otherwise, return itself.
    // AoT
    /** @docs-private */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    protected getButtonCallableProp(options: IModalButtonOptions<T>, prop: string): {} {
        const value = options[prop];
        const args: any[] = [];

        if (this.contentComponentRef) {
            args.push(this.contentComponentRef.instance);
        }

        return typeof value === 'function' ? value.apply(options, args) : value;
    }

    // On kbqFooter's modal button click
    // AoT
    /** @docs-private */
    protected onButtonClick(button: IModalButtonOptions<T>) {
        // Call onClick directly
        const result = this.getButtonCallableProp(button, 'onClick');

        if (isPromise(result)) {
            button.loading = true;
            // eslint-disable-next-line @typescript-eslint/no-empty-object-type
            (result as Promise<{}>).then(() => (button.loading = false)).catch(() => (button.loading = false));
        }
    }

    /** Whether anything is rendered that can name the dialog. */
    private hasTitle(): boolean {
        return this.composedTitle || (this.isModalType('default') && !!this.kbqTitle());
    }

    /** Whether anything is rendered that can describe the dialog. */
    private hasCaption(): boolean {
        return this.composedCaption || (this.isModalType('default') && !!this.kbqCaption());
    }

    // Do rest things when visible state changed
    private handleVisibleStateChange(visible: boolean, animation: boolean = true, closeResult?: R): Promise<any> {
        if (visible) {
            this.captureFocus();
            this.modalControl.setVisible(this, true);
            // Hide scrollbar at the first time when shown up
            this.changeBodyOverflow();
            this.focusOnShow();
        } else {
            this.kbqBeforeClose.emit(closeResult);
            this.modalControl.setVisible(this, false);
        }

        return (
            Promise.resolve(animation && this.animateTo(visible))
                // Emit open/close event after animations over
                .then(() => {
                    if (visible) {
                        this.scrollbarViewports().forEach((viewport) => viewport.flashScrollIndicators());
                        this.kbqAfterOpen.emit();
                    } else {
                        this.kbqAfterClose.emit(closeResult);
                        // Show/hide scrollbar when animation is over
                        this.changeBodyOverflow();
                        this.restoreFocus();
                    }
                })
        );
    }

    /**
     * Remembers the element and the input modality to restore focus to. Both entry paths run
     * through here, so a declarative `<kbq-modal [(kbqVisible)]>` restores focus like a
     * service-created one.
     */
    private captureFocus(): void {
        this.focusedElementBeforeOpen = _getFocusedElementPierceShadowDom();
        // `FocusMonitor` keeps the last origin private; the modality detector behind it is public
        // and reports the same thing. No modality means the focus was moved by code.
        this.previouslyFocusedElementOrigin = this.inputModalityDetector.mostRecentModality ?? 'program';

        this.monitorContainer();
    }

    /**
     * Registers the dialog element with `FocusMonitor` so focus inside it carries an origin. The
     * registration is torn down on the first focus event and, failing that, on destroy — a dialog
     * focus never reaches would otherwise stay in the root-provided monitor forever.
     */
    private monitorContainer(): void {
        if (!this.viewInitialized || this.monitoredContainer) return;

        this.monitoredContainer = this.modalContainer();
        this.focusMonitorSubscription = this.focusMonitor
            .monitor(this.monitoredContainer, true)
            .pipe(take(1))
            .subscribe(() => {
                if (this.monitoredContainer) {
                    this.focusMonitor.stopMonitoring(this.monitoredContainer);
                    this.monitoredContainer = null;
                }
            });
    }

    private restoreFocus(): void {
        if (this.kbqRestoreFocus() && this.focusedElementBeforeOpen) {
            this.focusMonitor.focusVia(this.focusedElementBeforeOpen, this.previouslyFocusedElementOrigin);

            this.focusedElementBeforeOpen = null;
        }
    }

    /** Moves focus into the dialog once the shown state has been rendered. */
    private focusOnShow(): void {
        if (!this.viewInitialized) return;

        afterNextRender(() => this.focusInitialElement(), { injector: this.injector });
    }

    /**
     * Initial focus policy. An explicit `[cdkFocusInitial]`/`autofocus` inside the dialog always
     * wins; otherwise `kbqAutoFocus` decides. The dialog element itself is the last resort, so a
     * modal without a single tabbable control still takes focus off the trigger behind it.
     */
    private focusInitialElement(): void {
        if (this.kbqAutoFocus() === false) return;

        const element = this.getElement();
        const { focusTrap } = this.trapFocus();

        // `cdkFocusInitial` is a bare attribute the CDK's own `focusInitialElement()` reads, not a
        // directive, and that helper cannot be used here: it falls back to the first tabbable control
        // whenever the marker is absent or its target fails the CDK's visibility check, which is
        // exactly what 'dialog' and 'first-heading' must not do. So the marker is read directly, and
        // it beats `autofocus` instead of losing to whichever comes first in document order.
        const marked =
            element.querySelector<HTMLElement>('[cdkFocusInitial], [cdk-focus-initial]') ??
            // Not part of the CDK's contract, but the predefined buttons carry it and the native
            // attribute does nothing for an element inserted after the page has loaded.
            element.querySelector<HTMLElement>('[autofocus]');

        if (marked) {
            marked.focus();

            return;
        }

        if (this.kbqAutoFocus() === 'first-tabbable' && focusTrap.focusFirstTabbableElement()) return;

        if (this.kbqAutoFocus() === 'first-heading') {
            const heading = element.querySelector<HTMLElement>('.kbq-modal-title');

            if (heading) {
                heading.tabIndex = -1;
                heading.focus();

                return;
            }
        }

        (this.modalContainer().nativeElement as HTMLElement).focus();
    }

    // Change kbqVisible from inside
    private changeVisibleFromInside(visible: boolean, closeResult?: R): Promise<void> {
        if (this.kbqVisible() === visible) return Promise.resolve();

        // Claimed before the write, because `model.set()` reports it through `ngOnChanges` too and
        // the flow is run here, synchronously, where the caller can still await it.
        this.handledVisible = visible;
        this.kbqVisible.set(visible);

        return this.handleVisibleStateChange(visible, true, closeResult);
    }

    /**
     * Runs the open/close flow for a visibility that arrived through a binding. A value this dialog
     * set itself has already been handled, so it is skipped.
     */
    private syncVisibleState(firstChange: boolean): void {
        const visible = this.kbqVisible();

        if (visible === this.handledVisible) return;

        this.handledVisible = visible;

        // A dialog that starts hidden has nothing to report: running the close path here used to
        // emit `kbqBeforeClose`/`kbqAfterClose` before the dialog had ever been shown.
        if (!firstChange || visible) {
            // Do not trigger animation while initializing
            this.handleVisibleStateChange(visible, !firstChange);
        }
    }

    private changeAnimationState(state: AnimationState) {
        this.animationState = state;
        this.animationPhase.set(state);
        this.animateMaskTo(state);

        if (this.contentComponentRef) {
            this.contentComponentRef.changeDetectorRef.markForCheck();
        } else {
            this.changeDetector.markForCheck();
        }
    }

    /**
     * Runs the enter/leave animation and settles when it is really over: on `animationend`, as soon
     * as the dialog is rendered when the user asked for reduced motion, and on a timer when neither
     * arrives.
     */
    private animateTo(isVisible: boolean): Promise<any> {
        this.changeAnimationState(isVisible ? 'enter' : 'leave');

        if (this.prefersReducedMotion()) {
            this.changeAnimationState(null);

            // There is no animation to wait for, but `open()` still runs before the first change
            // detection on the imperative path. Settling synchronously would report the dialog as
            // open before its view exists, and everything hanging off that — the scrollbar flash,
            // whatever a consumer does in `afterOpen` — would find nothing to act on.
            if (this.viewInitialized) return Promise.resolve(null);

            return new Promise((resolve) => afterNextRender(() => resolve(null), { injector: this.injector }));
        }

        return new Promise((resolve) => {
            // `open()` runs before the first change detection on the imperative path, so the view
            // may not exist yet; the timer alone drives the promise then.
            const container = this.viewInitialized ? (this.modalContainer().nativeElement as HTMLElement) : null;
            let settled = false;
            let timer: ReturnType<typeof setTimeout> | undefined;
            let unlisten: (() => void) | undefined;

            const finish = () => {
                if (settled) return;

                settled = true;

                if (timer) {
                    clearTimeout(timer);
                    timer = undefined;
                }

                unlisten?.();
                unlisten = undefined;
                this.changeAnimationState(null);
                resolve(null);
            };

            if (container) {
                unlisten = this.renderer.listen(container, 'animationend', (event: AnimationEvent) => {
                    // The dialog hosts animated content of its own, and `animationend` bubbles.
                    if (event.target === container) finish();
                });
            }

            timer = setTimeout(finish, MODAL_ANIMATE_DURATION);
        });
    }

    private prefersReducedMotion(): boolean {
        return (
            typeof this.window.matchMedia === 'function' &&
            this.window.matchMedia('(prefers-reduced-motion: reduce)').matches
        );
    }

    private formatModalButtons(buttons: IModalButtonOptions<T>[]): IModalButtonOptions<T>[] {
        return buttons.map((button) => {
            return {
                ...{
                    type: 'default',
                    size: 'default',
                    autoLoading: true,
                    show: true,
                    loading: false,
                    disabled: false
                },
                ...button
            };
        });
    }

    /**
     * Create a component dynamically but not attach to any View
     * (this action will be executed when bodyContainer is ready)
     * @param component Component class
     */
    private createDynamicComponent(component: Type<T>) {
        const childInjector = Injector.create({
            providers: [{ provide: KbqModalRef, useValue: this }],
            parent: this.viewContainer.injector
        });

        // `ngOnInit` runs this for `kbqContent` and `kbqComponent` in turn, and only the last one is
        // ever inserted into `bodyContainer`, so an overwritten ref would have nothing to destroy it.
        this.contentComponentRef?.destroy();

        this.contentComponentRef = createComponent(component, {
            environmentInjector: this.environmentInjector,
            elementInjector: childInjector
        });

        // Do the first change detection immediately
        // (or we do detection at ngAfterViewInit, multi-changes error will be thrown)
        this.contentComponentRef.changeDetectorRef.detectChanges();
    }

    /** Locks the body scroll while any dialog is shown, and releases it once none is. */
    private changeBodyOverflow() {
        if (this.modalControl.visibleModals().length > 0) {
            this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
        } else {
            this.renderer.removeStyle(this.document.body, 'overflow');
        }
    }
}

function isPromise(obj: unknown | void): boolean {
    return (
        !!obj &&
        (typeof obj === 'object' || typeof obj === 'function') &&
        typeof (obj as Promise<unknown>).then === 'function' &&
        typeof (obj as Promise<unknown>).catch === 'function'
    );
}
