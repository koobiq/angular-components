import { CdkTrapFocus, FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    createComponent,
    ElementRef,
    EnvironmentInjector,
    EventEmitter,
    inject,
    Injector,
    input,
    OnChanges,
    OnDestroy,
    OnInit,
    output,
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
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { KbqButtonColor, KbqButtonModule } from '@koobiq/components/button';
import {
    ENTER,
    ESCAPE,
    KBQ_A11Y_LOCALE_CONFIGURATION,
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
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { CssUnitPipe } from './css-unit.pipe';
import { KbqModalControlService } from './modal-control.service';
import { KbqModalRef } from './modal-ref.class';
import { modalUtilObject as ModalUtil } from './modal-util';
import {
    IModalButtonOptions,
    MODAL_ANIMATE_DURATION,
    ModalOptions,
    ModalSize,
    ModalType,
    OnClickCallback
} from './modal.type';

type AnimationState = 'enter' | 'leave' | null;

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
export class KbqModalComponent<T = any, R = any>
    extends KbqModalRef<T, R>
    implements OnInit, OnChanges, AfterViewInit, OnDestroy, ModalOptions
{
    private overlay = inject(Overlay);
    private renderer = inject(Renderer2);
    private environmentInjector = inject(EnvironmentInjector);
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private viewContainer = inject(ViewContainerRef);
    private modalControl = inject(KbqModalControlService);
    private changeDetector = inject(ChangeDetectorRef);
    private focusMonitor = inject(FocusMonitor);

    /** Accessible name for the icon-only close button. */
    protected readonly a11yLocaleConfiguration = inject(KbqLocaleOverridesDirective, { self: true }).read(
        'a11y',
        KBQ_A11Y_LOCALE_CONFIGURATION
    );

    protected readonly document = inject<Document>(DOCUMENT);

    componentColors = KbqComponentColors;

    kbqModalType: ModalType = 'default';

    // The instance of component opened into the dialog.
    kbqComponent: Type<T>;

    // If not specified, will use <ng-content>
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    kbqContent: string | TemplateRef<{}> | Type<T>;

    // Default Modal ONLY
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    kbqFooter: string | TemplateRef<{}> | IModalButtonOptions<T>[];

    kbqVisible = false;

    readonly kbqVisibleChange = output<boolean>();

    kbqWidth: number | string;
    kbqSize: ModalSize = ModalSize.Medium;
    kbqWrapClassName: string;
    kbqClassName: string;
    kbqStyle: object;

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    kbqTitle: string | TemplateRef<{}>;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    kbqCaption: string | TemplateRef<{}>;
    kbqCloseByESC: boolean = true;

    // A signal, so that the OnPush `KbqModalTitle` in the view of a content component follows it: the modal's
    // `markForCheck()` does not reach that view.
    get kbqClosable(): boolean {
        return this._kbqClosable();
    }

    set kbqClosable(value: boolean) {
        this._kbqClosable.set(value);
    }

    private readonly _kbqClosable = signal(true);

    // A signal, so that moving the mask between stacked modals needs no `markForCheck()` of either one.
    get kbqMask(): boolean {
        return this._kbqMask();
    }

    set kbqMask(value: boolean) {
        this._kbqMask.set(value);
    }

    private readonly _kbqMask = signal(true);

    kbqMaskClosable = false;
    kbqMaskStyle: object;
    kbqBodyStyle: object;

    // Trigger when modal open(visible) after animations
    readonly kbqAfterOpen = new EventEmitter<void>();

    /** @docs-private */
    readonly kbqAfterOpenOutput = outputFromObservable(this.kbqAfterOpen, { alias: 'kbqAfterOpen' });

    // Trigger when modal leave-animation over
    readonly kbqAfterClose = new EventEmitter<R | undefined>();

    /** @docs-private */
    readonly kbqAfterCloseOutput = outputFromObservable(this.kbqAfterClose, { alias: 'kbqAfterClose' });

    /** Emitted before the modal begins its closing animation. */
    readonly kbqBeforeClose = new EventEmitter<R | undefined>();

    /** @docs-private */
    readonly kbqBeforeCloseOutput = outputFromObservable(this.kbqBeforeClose, { alias: 'kbqBeforeClose' });

    // --- Predefined OK & Cancel buttons
    kbqOkText: string;

    /** Color of the predefined OK button. */
    kbqOkType: KbqButtonColor = KbqComponentColors.Contrast;

    kbqRestoreFocus = true;

    // A signal, so that the OK button follows a promise returned by `kbqOnOk` settling, which notifies nothing.
    get kbqOkLoading(): boolean {
        return this._kbqOkLoading();
    }

    set kbqOkLoading(value: boolean) {
        this._kbqOkLoading.set(value);
    }

    private readonly _kbqOkLoading = signal(false);

    // The default emitter backs the `kbqOnOk` output; a callback that is bound or passed replaces it.
    kbqOnOk: EventEmitter<T> | OnClickCallback<T> = new EventEmitter<T>();

    /** @docs-private */
    readonly kbqOnOkOutput = outputFromObservable(this.kbqOnOk as EventEmitter<T>, { alias: 'kbqOnOk' });

    kbqCancelText: string;

    // A signal for the same reason as `kbqOkLoading`.
    get kbqCancelLoading(): boolean {
        return this._kbqCancelLoading();
    }

    set kbqCancelLoading(value: boolean) {
        this._kbqCancelLoading.set(value);
    }

    private readonly _kbqCancelLoading = signal(false);

    // The default emitter backs the `kbqOnCancel` output; a callback that is bound or passed replaces it.
    kbqOnCancel: EventEmitter<T> | OnClickCallback<T> = new EventEmitter<T>();

    /** @docs-private */
    readonly kbqOnCancelOutput = outputFromObservable(this.kbqOnCancel as EventEmitter<T>, { alias: 'kbqOnCancel' });

    readonly modalContainer = viewChild.required<ElementRef>('modalContainer');
    readonly bodyContainer = viewChild.required('bodyContainer', { read: ViewContainerRef });
    // Both the scrollable wrap and the body of a predefined layout, so a query for one would flash
    // whichever comes first in the template rather than the one that overflows.
    private readonly scrollbarViewports = viewChildren(KbqScrollbarViewport);
    // Only aim to focus the ok button that needs to be auto focused
    readonly autoFocusedButtons = viewChildren('autoFocusedButton', { read: ElementRef });

    get maskAnimationClassMap(): object | null {
        return this._maskAnimationClassMap();
    }

    set maskAnimationClassMap(value: object | null) {
        this._maskAnimationClassMap.set(value);
    }

    // A signal: the control service moves the mask between modals while another modal's view is being checked.
    private readonly _maskAnimationClassMap = signal<object | null>(null);

    get modalAnimationClassMap(): object | null {
        return this._modalAnimationClassMap();
    }

    set modalAnimationClassMap(value: object | null) {
        this._modalAnimationClassMap.set(value);
    }

    private readonly _modalAnimationClassMap = signal<object | null>(null);

    // The origin point that animation based on
    transformOrigin = '0px 0px 0px';

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
        return !this.kbqVisible && !this.animationState();
    }

    private focusedElementBeforeOpen: HTMLElement | null;

    private previouslyFocusedElementOrigin: FocusOrigin;

    // Handle the reference when using kbqContent as Component
    private contentComponentRef: ComponentRef<T>;
    // Current animation state
    private readonly animationState = signal<AnimationState>(null);
    private container: HTMLElement | OverlayRef;

    kbqGetContainer: HTMLElement | OverlayRef | (() => HTMLElement | OverlayRef) = () => this.overlay.create();

    /** @docs-private */
    readonly kbqModalTypeInput = input<ModalOptions<T, R>['kbqModalType']>(undefined, { alias: 'kbqModalType' });

    /** @docs-private */
    readonly kbqComponentInput = input<ModalOptions<T, R>['kbqComponent']>(undefined, { alias: 'kbqComponent' });

    /** @docs-private */
    readonly kbqContentInput = input<ModalOptions<T, R>['kbqContent']>(undefined, { alias: 'kbqContent' });

    /** @docs-private */
    readonly kbqFooterInput = input<ModalOptions<T, R>['kbqFooter']>(undefined, { alias: 'kbqFooter' });

    /** @docs-private */
    readonly kbqVisibleInput = input<ModalOptions<T, R>['kbqVisible']>(undefined, { alias: 'kbqVisible' });

    /** @docs-private */
    readonly kbqWidthInput = input<ModalOptions<T, R>['kbqWidth']>(undefined, { alias: 'kbqWidth' });

    /** @docs-private */
    readonly kbqSizeInput = input<ModalOptions<T, R>['kbqSize']>(undefined, { alias: 'kbqSize' });

    /** @docs-private */
    readonly kbqWrapClassNameInput = input<ModalOptions<T, R>['kbqWrapClassName']>(undefined, {
        alias: 'kbqWrapClassName'
    });

    /** @docs-private */
    readonly kbqClassNameInput = input<ModalOptions<T, R>['kbqClassName']>(undefined, { alias: 'kbqClassName' });

    /** @docs-private */
    readonly kbqStyleInput = input<ModalOptions<T, R>['kbqStyle']>(undefined, { alias: 'kbqStyle' });

    /** @docs-private */
    readonly kbqTitleInput = input<ModalOptions<T, R>['kbqTitle']>(undefined, { alias: 'kbqTitle' });

    /** @docs-private */
    readonly kbqCaptionInput = input<ModalOptions<T, R>['kbqCaption']>(undefined, { alias: 'kbqCaption' });

    /** @docs-private */
    readonly kbqCloseByESCInput = input<ModalOptions<T, R>['kbqCloseByESC']>(undefined, { alias: 'kbqCloseByESC' });

    /** @docs-private */
    readonly kbqClosableInput = input<ModalOptions<T, R>['kbqClosable']>(undefined, { alias: 'kbqClosable' });

    /** @docs-private */
    readonly kbqMaskInput = input<ModalOptions<T, R>['kbqMask']>(undefined, { alias: 'kbqMask' });

    /** @docs-private */
    readonly kbqMaskClosableInput = input<ModalOptions<T, R>['kbqMaskClosable']>(undefined, {
        alias: 'kbqMaskClosable'
    });

    /** @docs-private */
    readonly kbqMaskStyleInput = input<ModalOptions<T, R>['kbqMaskStyle']>(undefined, { alias: 'kbqMaskStyle' });

    /** @docs-private */
    readonly kbqBodyStyleInput = input<ModalOptions<T, R>['kbqBodyStyle']>(undefined, { alias: 'kbqBodyStyle' });

    /** @docs-private */
    readonly kbqOkTextInput = input<ModalOptions<T, R>['kbqOkText']>(undefined, { alias: 'kbqOkText' });

    /** @docs-private */
    readonly kbqOkTypeInput = input<ModalOptions<T, R>['kbqOkType']>(undefined, { alias: 'kbqOkType' });

    /** @docs-private */
    readonly kbqRestoreFocusInput = input<ModalOptions<T, R>['kbqRestoreFocus']>(undefined, {
        alias: 'kbqRestoreFocus'
    });

    /** @docs-private */
    readonly kbqOkLoadingInput = input<ModalOptions<T, R>['kbqOkLoading']>(undefined, { alias: 'kbqOkLoading' });

    /** @docs-private */
    readonly kbqOnOkInput = input<ModalOptions<T, R>['kbqOnOk']>(undefined, { alias: 'kbqOnOk' });

    /** @docs-private */
    readonly kbqCancelTextInput = input<ModalOptions<T, R>['kbqCancelText']>(undefined, { alias: 'kbqCancelText' });

    /** @docs-private */
    readonly kbqCancelLoadingInput = input<ModalOptions<T, R>['kbqCancelLoading']>(undefined, {
        alias: 'kbqCancelLoading'
    });

    /** @docs-private */
    readonly kbqOnCancelInput = input<ModalOptions<T, R>['kbqOnCancel']>(undefined, { alias: 'kbqOnCancel' });

    /** @docs-private */
    readonly kbqGetContainerInput = input<NonNullable<ModalOptions<T, R>['kbqGetContainer']> | undefined>(undefined, {
        alias: 'kbqGetContainer'
    });

    // Not called for a modal created by `KbqModalService`, which writes the options to the members directly. A
    // component given as `kbqContent` or `kbqComponent` is created once, in `ngOnInit`.
    ngOnChanges(changes: SimpleChanges): void {
        // A bound input is handed to its member as the decorator input did; unbound, it leaves what code wrote.
        const handOver = <K extends keyof KbqModalComponent<T, R>>(
            member: K,
            boundValue: () => KbqModalComponent<T, R>[K] | undefined
        ): void => {
            if (!changes[`${member}Input`]) return;

            const value = boundValue();

            if (value !== undefined) (this as KbqModalComponent<T, R>)[member] = value;
        };

        handOver('kbqModalType', this.kbqModalTypeInput);
        handOver('kbqComponent', this.kbqComponentInput);
        handOver('kbqContent', this.kbqContentInput);
        handOver('kbqFooter', this.kbqFooterInput);
        handOver('kbqVisible', this.kbqVisibleInput);
        handOver('kbqWidth', this.kbqWidthInput);
        handOver('kbqSize', this.kbqSizeInput);
        handOver('kbqWrapClassName', this.kbqWrapClassNameInput);
        handOver('kbqClassName', this.kbqClassNameInput);
        handOver('kbqStyle', this.kbqStyleInput);
        handOver('kbqTitle', this.kbqTitleInput);
        handOver('kbqCaption', this.kbqCaptionInput);
        handOver('kbqCloseByESC', this.kbqCloseByESCInput);
        handOver('kbqClosable', this.kbqClosableInput);
        handOver('kbqMask', this.kbqMaskInput);
        handOver('kbqMaskClosable', this.kbqMaskClosableInput);
        handOver('kbqMaskStyle', this.kbqMaskStyleInput);
        handOver('kbqBodyStyle', this.kbqBodyStyleInput);
        handOver('kbqOkText', this.kbqOkTextInput);
        handOver('kbqOkType', this.kbqOkTypeInput);
        handOver('kbqRestoreFocus', this.kbqRestoreFocusInput);
        handOver('kbqOkLoading', this.kbqOkLoadingInput);
        handOver('kbqOnOk', this.kbqOnOkInput);
        handOver('kbqCancelText', this.kbqCancelTextInput);
        handOver('kbqCancelLoading', this.kbqCancelLoadingInput);
        handOver('kbqOnCancel', this.kbqOnCancelInput);
        handOver('kbqGetContainer', this.kbqGetContainerInput);

        if (changes['kbqVisibleInput']) {
            // Do not trigger animation while initializing
            this.handleVisibleStateChange(this.kbqVisible, !changes['kbqVisibleInput'].firstChange);
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

        // Place the modal dom to elsewhere
        this.container = typeof this.kbqGetContainer === 'function' ? this.kbqGetContainer() : this.kbqGetContainer;

        if (this.container instanceof HTMLElement) {
            this.container.appendChild(this.elementRef.nativeElement);
        } else if (this.container instanceof OverlayRef) {
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

        this.getElement().getElementsByTagName('button')[0]?.focus();

        (this.getElement().querySelector('button[autofocus]') as HTMLButtonElement)?.focus();
    }

    ngOnDestroy() {
        // Created in `ngOnInit` but owned by `bodyContainer` only from `ngAfterViewInit`, so a modal
        // closed in between would leak it. Destroying an already-destroyed view is a no-op.
        this.contentComponentRef?.destroy();

        if (this.container instanceof OverlayRef) {
            this.container.dispose();
        }
    }

    open() {
        this.focusedElementBeforeOpen = _getFocusedElementPierceShadowDom();
        this.previouslyFocusedElementOrigin = this.focusMonitor['_lastFocusOrigin'];

        this.focusMonitor
            .monitor(this.modalContainer(), true)
            .pipe(take(1))
            .subscribe(() => this.focusMonitor.stopMonitoring(this.modalContainer()));

        this.changeVisibleFromInside(true);
    }

    close(result?: R) {
        this.changeVisibleFromInside(false, result).then(() => {
            if (this.kbqRestoreFocus && this.focusedElementBeforeOpen) {
                this.focusMonitor.focusVia(
                    this.focusedElementBeforeOpen as HTMLElement,
                    this.previouslyFocusedElementOrigin
                );

                this.focusedElementBeforeOpen = null;
            }
        });
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

    getKbqFooter(): HTMLElement {
        return this.getElement().getElementsByClassName('kbq-modal-footer').item(0) as HTMLElement;
    }

    onClickMask($event: MouseEvent) {
        // Only the primary button closes the modal: the sidepanel's backdrop is driven by `click`, which
        // never fires for the right or middle button, and `mousedown` here would otherwise diverge from it.
        if ($event.button !== 0) return;

        if (
            this.kbqMask &&
            this.kbqMaskClosable &&
            ($event.target as HTMLElement).classList.contains('kbq-modal-wrap') &&
            this.kbqVisible
        ) {
            this.onClickOkCancel('cancel');
        }
    }

    isModalType(type: ModalType): boolean {
        return this.kbqModalType === type;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === ESCAPE && this.container && this.container instanceof OverlayRef) {
            this.close();
            event.preventDefault();
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
    onClickCloseBtn() {
        if (this.kbqVisible) {
            this.onClickOkCancel('cancel');
        }
    }

    // AoT
    onClickOkCancel(type: 'ok' | 'cancel') {
        this.handleCloseResult(type, (doClose) => doClose !== false);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    handleCloseResult(triggerType: 'ok' | 'cancel', canClose: (doClose: boolean | void | {}) => boolean) {
        const trigger = { ok: this.kbqOnOk, cancel: this.kbqOnCancel }[triggerType];
        const loadingKey = { ok: 'kbqOkLoading', cancel: 'kbqCancelLoading' }[triggerType];

        if (trigger instanceof EventEmitter) {
            trigger.emit(this.getContentComponent());
        } else if (typeof trigger === 'function') {
            const result = trigger(this.getContentComponent());
            // Users can return "false" to prevent closing by default
            // eslint-disable-next-line @typescript-eslint/no-empty-object-type
            const caseClose = (doClose: boolean | void | {}) => canClose(doClose) && this.close(doClose as R);

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
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    isNonEmptyString(value: {}): boolean {
        return typeof value === 'string' && value !== '';
    }

    // AoT
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    isTemplateRef(value: {}): boolean {
        return value instanceof TemplateRef;
    }

    // AoT
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    isComponent(value: {}): boolean {
        return value instanceof Type;
    }

    // AoT
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    isModalButtons(value: {}): boolean {
        return Array.isArray(value) && value.length > 0;
    }

    // Lookup a button's property, if the prop is a function, call & then return the result, otherwise, return itself.
    // AoT
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    getButtonCallableProp(options: IModalButtonOptions<T>, prop: string): {} {
        const value = options[prop];
        const args: any[] = [];

        if (this.contentComponentRef) {
            args.push(this.contentComponentRef.instance);
        }

        return typeof value === 'function' ? value.apply(options, args) : value;
    }

    /** Returns the full set of classes for the modal container: base, custom class name, size and animation classes. */
    protected getContainerClasses(): string {
        const classes = ['kbq-modal-container', this.kbqClassName, `kbq-modal_${this.kbqSize}`];

        if (this.modalAnimationClassMap) {
            const animationClasses = this.modalAnimationClassMap as { [key: string]: boolean };

            classes.push(...Object.keys(animationClasses).filter((key) => animationClasses[key]));
        }

        return classes.filter(Boolean).join(' ');
    }

    // On kbqFooter's modal button click
    // AoT
    onButtonClick(button: IModalButtonOptions<T>) {
        // Call onClick directly
        const result = this.getButtonCallableProp(button, 'onClick');

        if (isPromise(result)) {
            button.loading = true;

            // A plain object, so the view is told once the promise settles.
            const stopLoading = () => {
                button.loading = false;
                this.markForCheck();
            };

            // eslint-disable-next-line @typescript-eslint/no-empty-object-type
            (result as Promise<{}>).then(stopLoading).catch(stopLoading);
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

    // Do rest things when visible state changed
    private handleVisibleStateChange(visible: boolean, animation: boolean = true, closeResult?: R): Promise<any> {
        // Hide scrollbar at the first time when shown up
        if (visible) {
            this.changeBodyOverflow(1);
        } else {
            this.kbqBeforeClose.emit(closeResult);
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
                    }
                })
        );
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
        this.animationState.set(state);

        this.animateMaskTo(state);

        if (state) {
            this.modalAnimationClassMap = {
                [`zoom-${state}`]: true,
                [`zoom-${state}-active`]: true
            };
        } else {
            this.modalAnimationClassMap = null;
        }

        // The content component is the consumer's view, which may rely on an animation step to be refreshed.
        this.contentComponentRef?.changeDetectorRef.markForCheck();
    }

    private animateTo(isVisible: boolean): Promise<any> {
        // Figure out the latest click position when shows up
        if (isVisible) {
            // [NOTE] Using timeout due to the document.click event is fired later than visible change,
            // so if not postponed to next event-loop, we can't get the latest click position
            setTimeout(() => this.updateTransformOrigin());
        }

        this.changeAnimationState(isVisible ? 'enter' : 'leave');

        // Return when animation is over
        return new Promise((resolve) => {
            return setTimeout(() => {
                this.changeAnimationState(null);
                resolve(null);
            }, MODAL_ANIMATE_DURATION);
        });
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

    // Update transform-origin to the last click position on document
    private updateTransformOrigin() {
        const modalElement = this.modalContainer().nativeElement as HTMLElement;
        const lastPosition = ModalUtil.getLastClickPosition();

        if (lastPosition) {
            this.transformOrigin = `${lastPosition.x - modalElement.offsetLeft}px ${lastPosition.y - modalElement.offsetTop}px 0px`;
        }
    }

    /**
     * Take care of the body's overflow to decide the existence of scrollbar
     * @param plusNum The number that the openModals.length will increase soon
     */
    private changeBodyOverflow(plusNum: number = 0) {
        const openModals = this.modalControl.openModals;

        if (openModals.length + plusNum > 0) {
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
