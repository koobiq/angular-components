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
    ComponentFactoryResolver,
    ComponentRef,
    ElementRef,
    EventEmitter,
    inject,
    Injector,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    output,
    Renderer2,
    signal,
    SimpleChanges,
    TemplateRef,
    Type,
    viewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { KbqButtonColor, KbqButtonModule } from '@koobiq/components/button';
import {
    ENTER,
    ESCAPE,
    KBQ_WINDOW,
    KbqComponentColors,
    kbqInjectA11yLocaleConfiguration,
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
    KbqModalAutoFocus,
    MODAL_ANIMATE_DURATION,
    ModalOptions,
    ModalSize,
    ModalType,
    OnClickCallback
} from './modal.type';

/** Phase of the open/close animation the dialog is in, or `null` between phases. */
export type AnimationState = 'enter' | 'leave' | null;

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
    }
})
export class KbqModalComponent<T = any, R = any>
    extends KbqModalRef<T, R>
    implements OnInit, OnChanges, AfterViewInit, OnDestroy, ModalOptions
{
    private overlay = inject(Overlay);
    private renderer = inject(Renderer2);
    private cfr = inject(ComponentFactoryResolver);
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private viewContainer = inject(ViewContainerRef);
    private modalControl = inject(KbqModalControlService);
    private changeDetector = inject(ChangeDetectorRef);
    private focusMonitor = inject(FocusMonitor);
    private readonly inputModalityDetector = inject(InputModalityDetector);
    private readonly injector = inject(Injector);
    private readonly window = inject(KBQ_WINDOW);

    /** Accessible name for the icon-only close button. */
    protected readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();

    protected readonly document = inject<Document>(DOCUMENT);

    componentColors = KbqComponentColors;

    /** Layout the dialog renders. */
    @Input() kbqModalType: ModalType = 'default';

    /** The instance of component opened into the dialog. */
    @Input() kbqComponent: Type<T>;

    /** Body of the dialog: text, a template or a component class. Falls back to `<ng-content>`. */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    @Input() kbqContent: string | TemplateRef<{}> | Type<T>;

    /** Footer of the dialog: text, a template, or the buttons to render. Default modal ONLY. */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    @Input() kbqFooter: string | TemplateRef<{}> | IModalButtonOptions<T>[];

    /** Whether the dialog is shown. */
    @Input()
    get kbqVisible() {
        return this._kbqVisible;
    }
    set kbqVisible(value) {
        this._kbqVisible = value;
    }

    private _kbqVisible = false;

    /** Emits the new visibility, so `[(kbqVisible)]` stays in sync when the dialog closes itself. */
    readonly kbqVisibleChange = output<boolean>();

    /** Explicit width, overriding the one `kbqSize` implies. A number is read as pixels. */
    @Input() kbqWidth: number | string;
    /** Width preset. */
    @Input() kbqSize: ModalSize = ModalSize.Medium;
    /** Extra class names for the full-screen wrapper around the dialog. */
    @Input() kbqWrapClassName: string;
    /** Extra class names for the dialog element itself. */
    @Input() kbqClassName: string;
    /** Inline styles for the dialog element. */
    @Input() kbqStyle: object;

    /** Heading of the dialog. Also becomes its accessible name. */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    @Input() kbqTitle: string | TemplateRef<{}>;
    /** Secondary line under the heading. Also becomes the dialog's accessible description. */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    @Input() kbqCaption: string | TemplateRef<{}>;
    /** Whether <kbd>Escape</kbd> cancels the dialog. */
    @Input() kbqCloseByESC: boolean = true;

    /** Where focus lands when the dialog is shown. */
    @Input() kbqAutoFocus: KbqModalAutoFocus = 'first-tabbable';

    /** Accessible name for a dialog rendered without `kbqTitle` — a confirm or a header-less dialog. */
    @Input() kbqAriaLabel: string;

    /** Whether the header renders a close button. */
    @Input({ transform: booleanAttribute }) kbqClosable: boolean = true;

    /** Whether the page behind the dialog is dimmed. */
    @Input({ transform: booleanAttribute }) kbqMask: boolean = true;

    /** Whether a click on the dim layer cancels the dialog. */
    @Input({ transform: booleanAttribute }) kbqMaskClosable: boolean = false;

    /** Inline styles for the dim layer. */
    @Input() kbqMaskStyle: object;
    /** Inline styles for the body element. */
    @Input() kbqBodyStyle: object;

    // Trigger when modal open(visible) after animations
    @Output() readonly kbqAfterOpen = new EventEmitter<void>();
    // Trigger when modal leave-animation over
    @Output() readonly kbqAfterClose = new EventEmitter<R | undefined>();
    /** Emitted before the modal begins its closing animation. */
    @Output() readonly kbqBeforeClose = new EventEmitter<R | undefined>();

    // --- Predefined OK & Cancel buttons
    /** Caption of the predefined OK button. The button is not rendered without it. */
    @Input() kbqOkText: string;
    /** Color of the predefined OK button. */
    @Input() kbqOkType: KbqButtonColor = KbqComponentColors.Contrast;

    /** Whether focus returns to the trigger when the dialog closes. */
    @Input({ transform: booleanAttribute }) kbqRestoreFocus: boolean = true;

    /** Whether the predefined OK button renders its progress state. */
    @Input({ transform: booleanAttribute }) kbqOkLoading: boolean = false;

    /**
     * Handler of the predefined OK button. A function returning `false` (or a promise of `false`)
     * keeps the dialog open; an `EventEmitter` is notified and the dialog closes.
     */
    @Input() @Output() readonly kbqOnOk: EventEmitter<T> | OnClickCallback<T> = new EventEmitter<T>();
    /** Caption of the predefined Cancel button. The button is not rendered without it. */
    @Input() kbqCancelText: string;

    /** Whether the predefined Cancel button renders its progress state. */
    @Input({ transform: booleanAttribute }) kbqCancelLoading: boolean = false;

    /**
     * Handler of the predefined Cancel button, the close button, <kbd>Escape</kbd> and the dim
     * layer. A function returning `false` (or a promise of `false`) keeps the dialog open; an
     * `EventEmitter` is notified and the dialog closes.
     */
    @Input() @Output() readonly kbqOnCancel: EventEmitter<T> | OnClickCallback<T> = new EventEmitter<T>();

    readonly modalContainer = viewChild.required<ElementRef>('modalContainer');
    readonly bodyContainer = viewChild.required('bodyContainer', { read: ViewContainerRef });
    private readonly scrollbarViewport = viewChild(KbqScrollbarViewport);
    private readonly trapFocus = viewChild.required(CdkTrapFocus);

    /** @docs-private */
    protected maskAnimationClassMap: object | null;
    /** @docs-private */
    protected modalAnimationClassMap: object | null;

    private readonly uniqueId = uniqueIdCounter++;

    /** Id of the element that names the dialog. Rendered on the title of a composed modal too. */
    readonly titleId = `kbq-modal-title-${this.uniqueId}`;
    /** @docs-private */
    protected readonly captionId = `kbq-modal-caption-${this.uniqueId}`;

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

    get okText(): string {
        return this.kbqOkText;
    }

    get cancelText(): string {
        return this.kbqCancelText;
    }

    // Indicate whether this dialog should hidden
    get hidden(): boolean {
        return !this.kbqVisible && !this.animationState;
    }

    /** Whether the dialog renders a footer — a predefined button is enough, `kbqFooter` is not required. */
    protected get hasFooter(): boolean {
        return this.composedFooter || !!(this.kbqFooter || this.kbqOkText || this.kbqCancelText);
    }

    /** Id of the element naming the dialog, or `null` when there is no title to point at. */
    protected get ariaLabelledBy(): string | null {
        return this.hasTitle() ? this.titleId : null;
    }

    /** Accessible name for a dialog with no title. Never rendered next to `aria-labelledby`. */
    protected get ariaLabel(): string | null {
        return this.hasTitle() ? null : this.kbqAriaLabel || null;
    }

    /** Id of the caption describing the dialog, or `null` when no caption is rendered. */
    protected get ariaDescribedBy(): string | null {
        return this.isModalType('default') && this.kbqCaption ? this.captionId : null;
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

    /** Full set of classes for the dialog element, recomputed only when its inputs change. */
    protected containerClasses: string = '';

    private focusedElementBeforeOpen: HTMLElement | null;

    private previouslyFocusedElementOrigin: FocusOrigin;

    private monitoredContainer: ElementRef | null = null;
    private focusMonitorSubscription: Subscription | null = null;

    /** Whether a `kbq-modal-title` is composed inside the dialog body. */
    private composedTitle = false;

    /** Whether a `kbq-modal-footer` is composed inside the dialog body. */
    private composedFooter = false;

    private viewInitialized = false;

    // Handle the reference when using kbqContent as Component
    private contentComponentRef: ComponentRef<T>;
    // Current animation state
    private animationState: AnimationState;
    private container: HTMLElement | OverlayRef;

    /** Element or overlay the dialog is rendered into. Read once, on init. */
    @Input() kbqGetContainer: HTMLElement | OverlayRef | (() => HTMLElement | OverlayRef) = () => this.overlay.create();

    // [NOTE] NOT available when using by service!
    // Because ngOnChanges never be called when using by service,
    // here we can't support "kbqContent"(Component) etc. as inputs that initialized dynamically.
    // BUT: User also can change "kbqContent" dynamically to trigger UI changes
    // (provided you don't use Component that needs initializations)
    ngOnChanges(changes: SimpleChanges) {
        this.updateContainerClasses();

        if (changes.kbqVisible) {
            const { firstChange } = changes.kbqVisible;

            // A dialog that starts hidden has nothing to report: running the close path here used
            // to emit `kbqBeforeClose`/`kbqAfterClose` before the dialog had ever been shown.
            if (!firstChange || this.kbqVisible) {
                // Do not trigger animation while initializing
                this.handleVisibleStateChange(this.kbqVisible, !firstChange);
            }
        }
    }

    ngOnInit() {
        // Create component along without View
        if (this.isComponent(this.kbqContent)) {
            this.createDynamicComponent(this.kbqContent as Type<T>);
        }

        // Setup default button options
        if (this.isModalButtons(this.kbqFooter)) {
            this.kbqFooter = this.formatModalButtons(this.kbqFooter as IModalButtonOptions<T>[]);
        }

        if (this.isComponent(this.kbqComponent)) {
            this.createDynamicComponent(this.kbqComponent);
        }

        this.updateContainerClasses();

        // Place the modal dom to elsewhere
        this.container = typeof this.kbqGetContainer === 'function' ? this.kbqGetContainer() : this.kbqGetContainer;

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
            this.bodyContainer().insert(this.contentComponentRef.hostView);
        }

        this.viewInitialized = true;

        if (this.kbqVisible) {
            this.monitorContainer();
            this.focusInitialElement();
        }
    }

    ngOnDestroy() {
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

    /** Announces that a `kbq-modal-footer` is composed inside the dialog. @docs-private */
    registerFooter(): void {
        this.composedFooter = true;
    }

    /** Publishes the composed body's scroll-shadow state. @docs-private */
    setBodyOverflow(state: KbqOverflowShadowState): void {
        this.bodyOverflow.set(state);
    }

    // AoT
    onClickCloseBtn() {
        if (this.kbqVisible) {
            this.onClickOkCancel('cancel');
        }
    }

    /**
     * Sets mask animation classes for the given state, or clears them if state is null.
     * @docs-private
     */
    animateMaskTo(state: AnimationState) {
        this.maskAnimationClassMap = state
            ? {
                  [`fade-${state}`]: true,
                  [`fade-${state}-active`]: true
              }
            : null;
    }

    /** @docs-private */
    protected onClickMask($event: MouseEvent) {
        if (
            this.kbqMask &&
            this.kbqMaskClosable &&
            ($event.target as HTMLElement).classList.contains('kbq-modal-wrap') &&
            this.kbqVisible
        ) {
            this.onClickOkCancel('cancel');
        }
    }

    /** @docs-private */
    protected isModalType(type: ModalType): boolean {
        return this.kbqModalType === type;
    }

    /** @docs-private */
    onKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === ESCAPE) {
            // One implementation for both entry paths: the event only reaches the host from inside
            // the dialog, so it cannot be the keystroke that opened it. Escape is the Cancel
            // button, veto included.
            if (this.kbqCloseByESC && this.kbqVisible) {
                this.onClickOkCancel('cancel');
                event.preventDefault();
            }

            return;
        }

        if (event.ctrlKey && event.keyCode === ENTER) {
            if (this.kbqModalType === 'confirm') {
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
        const trigger = { ok: this.kbqOnOk, cancel: this.kbqOnCancel }[triggerType];
        const loadingKey = { ok: 'kbqOkLoading', cancel: 'kbqCancelLoading' }[triggerType];
        // Users can return "false" to prevent closing by default
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        const caseClose = (doClose: boolean | void | {}) => canClose(doClose) && this.close(doClose as R);

        if (trigger instanceof EventEmitter) {
            // The emitter form is a notification, not a veto: only the callable form can keep the
            // dialog open, by returning `false`.
            trigger.emit(this.getContentComponent());
            caseClose(undefined);
        } else if (typeof trigger === 'function') {
            const result = trigger(this.getContentComponent());

            if (isPromise(result)) {
                this[loadingKey] = true;

                const handleThen = (doClose) => {
                    this[loadingKey] = false;
                    caseClose(doClose);
                };

                (result as Promise<void>).then(handleThen).catch(handleThen);
            } else {
                caseClose(result);
            }
        }
    }

    // AoT
    /** @docs-private */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    protected isNonEmptyString(value: {}): boolean {
        return typeof value === 'string' && value !== '';
    }

    // AoT
    /** @docs-private */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    protected isTemplateRef(value: {}): boolean {
        return value instanceof TemplateRef;
    }

    // AoT
    /** @docs-private */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    protected isComponent(value: {}): boolean {
        return value instanceof Type;
    }

    // AoT
    /** @docs-private */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    protected isModalButtons(value: {}): boolean {
        return Array.isArray(value) && value.length > 0;
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
        return this.composedTitle || (this.isModalType('default') && !!this.kbqTitle);
    }

    private updateContainerClasses(): void {
        const classes = ['kbq-modal-container', this.kbqClassName, `kbq-modal_${this.kbqSize}`];

        if (this.modalAnimationClassMap) {
            const animationClasses = this.modalAnimationClassMap as { [key: string]: boolean };

            classes.push(...Object.keys(animationClasses).filter((key) => animationClasses[key]));
        }

        this.containerClasses = classes.filter(Boolean).join(' ');
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
                        this.scrollbarViewport()?.flashScrollIndicators();
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
        if (this.kbqRestoreFocus && this.focusedElementBeforeOpen) {
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
        if (this.kbqAutoFocus === false) return;

        const explicit = this.getElement().querySelector<HTMLElement>(
            '[cdkFocusInitial], [cdk-focus-initial], [autofocus]'
        );

        if (explicit) {
            explicit.focus();

            return;
        }

        if (this.kbqAutoFocus === 'first-tabbable' && this.trapFocus().focusTrap.focusFirstTabbableElement()) return;

        if (this.kbqAutoFocus === 'first-heading') {
            const heading = this.getElement().querySelector<HTMLElement>('.kbq-modal-title');

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
        if (this.kbqVisible !== visible) {
            // Change kbqVisible value immediately
            this.kbqVisible = visible;
            this.kbqVisibleChange.emit(visible);

            return this.handleVisibleStateChange(visible, true, closeResult);
        }

        return Promise.resolve();
    }

    private changeAnimationState(state: AnimationState) {
        this.animationState = state;

        this.animateMaskTo(state);

        if (state) {
            this.modalAnimationClassMap = {
                [`zoom-${state}`]: true,
                [`zoom-${state}-active`]: true
            };
        } else {
            this.modalAnimationClassMap = null;
        }

        this.updateContainerClasses();

        if (this.contentComponentRef) {
            this.contentComponentRef.changeDetectorRef.markForCheck();
        } else {
            this.changeDetector.markForCheck();
        }
    }

    /**
     * Runs the enter/leave animation and settles when it is really over: on `animationend`, at
     * once when the user asked for reduced motion, and on a timer when neither arrives.
     */
    private animateTo(isVisible: boolean): Promise<any> {
        this.changeAnimationState(isVisible ? 'enter' : 'leave');

        if (this.prefersReducedMotion()) {
            this.changeAnimationState(null);

            return Promise.resolve(null);
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
        const factory = this.cfr.resolveComponentFactory(component);
        const childInjector = Injector.create({
            providers: [{ provide: KbqModalRef, useValue: this }],
            parent: this.viewContainer.injector
        });

        this.contentComponentRef = factory.create(childInjector);

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
