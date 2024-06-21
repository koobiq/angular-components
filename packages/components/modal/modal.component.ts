import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    ElementRef,
    EventEmitter,
    Inject,
    Injector,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    Renderer2,
    SimpleChanges,
    TemplateRef,
    Type,
    ViewChild,
    ViewChildren,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { ESCAPE, ENTER } from '@koobiq/cdk/keycodes';
import { KbqComponentColors } from '@koobiq/components/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { KbqModalControlService } from './modal-control.service';
import { KbqModalRef } from './modal-ref.class';
import { modalUtilObject as ModalUtil } from './modal-util';
import { IModalButtonOptions, ModalOptions, ModalSize, ModalType, OnClickCallback } from './modal.type';


// Duration when perform animations (ms)
export const MODAL_ANIMATE_DURATION = 200;

type AnimationState = 'enter' | 'leave' | null;


@Component({
    selector: 'kbq-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(keydown)': 'onKeyDown($event)'
    }
})
export class KbqModalComponent<T = any, R = any> extends KbqModalRef<T, R>
    implements OnInit, OnChanges, AfterViewInit, OnDestroy, ModalOptions {

    componentColors = KbqComponentColors;

    @Input() kbqModalType: ModalType = 'default';

    // The instance of component opened into the dialog.
    @Input() kbqComponent: Type<T>;
    // If not specified, will use <ng-content>
    @Input() kbqContent: string | TemplateRef<{}> | Type<T>;
    // available when kbqContent is a component
    // @ts-ignore
    @Input() kbqComponentParams: any;
    // Default Modal ONLY
    @Input() kbqFooter: string | TemplateRef<{}> | IModalButtonOptions<T>[];

    @Input()
    get kbqVisible() { return this._kbqVisible; }
    set kbqVisible(value) { this._kbqVisible = value; }

    private _kbqVisible = false;

    @Output() kbqVisibleChange = new EventEmitter<boolean>();

    @Input() kbqWidth: number | string;
    @Input() kbqSize: ModalSize = ModalSize.Medium;
    @Input() kbqWrapClassName: string;
    @Input() kbqClassName: string;
    @Input() kbqStyle: object;
    @Input() kbqTitle: string | TemplateRef<{}>;
    @Input() kbqCloseByESC: boolean = true;

    @Input()
    get kbqClosable() { return this._kbqClosable; }
    set kbqClosable(value) { this._kbqClosable = value; }
    private _kbqClosable = true;

    @Input()
    get kbqMask() { return this._kbqMask; }
    set kbqMask(value) { this._kbqMask = value; }
    private _kbqMask = true;

    @Input()
    get kbqMaskClosable() { return this._kbqMaskClosable; }
    set kbqMaskClosable(value) { this._kbqMaskClosable = value; }
    private _kbqMaskClosable = false;

    @Input() kbqMaskStyle: object;
    @Input() kbqBodyStyle: object;

    // Trigger when modal open(visible) after animations
    @Output() kbqAfterOpen = new EventEmitter<void>();
    // Trigger when modal leave-animation over
    @Output() kbqAfterClose = new EventEmitter<R>();

    // --- Predefined OK & Cancel buttons
    @Input() kbqOkText: string;
    @Input() kbqOkType = KbqComponentColors.Contrast;

    @Input() kbqRestoreFocus = true;

    @Input()
    get kbqOkLoading() { return this._kbqOkLoading; }
    set kbqOkLoading(value) { this._kbqOkLoading = value; }
    private _kbqOkLoading = false;

    @Input() @Output() kbqOnOk: EventEmitter<T> | OnClickCallback<T> = new EventEmitter<T>();
    @Input() kbqCancelText: string;

    @Input()
    get kbqCancelLoading() { return this._kbqCancelLoading; }
    set kbqCancelLoading(value) { this._kbqCancelLoading = value; }
    private _kbqCancelLoading = false;

    @Input() @Output() kbqOnCancel: EventEmitter<T> | OnClickCallback<T> = new EventEmitter<T>();

    @ViewChild('modalContainer', { static: true }) modalContainer: ElementRef;
    @ViewChild('bodyContainer', { read: ViewContainerRef, static: false }) bodyContainer: ViewContainerRef;
    // Only aim to focus the ok button that needs to be auto focused
    @ViewChildren('autoFocusedButton', { read: ElementRef }) autoFocusedButtons: QueryList<ElementRef>;

    @ViewChild('modalBody') modalBody: ElementRef;

    isTopOverflow: boolean = false;
    isBottomOverflow: boolean = false;

    maskAnimationClassMap: object;
    modalAnimationClassMap: object;
    // The origin point that animation based on
    transformOrigin = '0px 0px 0px';

    // Observable alias for kbqAfterOpen
    get afterOpen(): Observable<void> {
        return this.kbqAfterOpen.asObservable();
    }

    // Observable alias for kbqAfterClose
    get afterClose(): Observable<R> {
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

    private focusedElementBeforeOpen: HTMLElement | null;

    private previouslyFocusedElementOrigin: FocusOrigin;

    // Handle the reference when using kbqContent as Component
    private contentComponentRef: ComponentRef<T>;
    // Current animation state
    private animationState: AnimationState;
    private container: HTMLElement | OverlayRef;

    constructor(
        private overlay: Overlay,
        private renderer: Renderer2,
        private cfr: ComponentFactoryResolver,
        private elementRef: ElementRef,
        private viewContainer: ViewContainerRef,
        private modalControl: KbqModalControlService,
        private changeDetector: ChangeDetectorRef,
        private focusMonitor: FocusMonitor,
        @Inject(DOCUMENT) private document: any
    ) {
        super();
    }

    @Input() kbqGetContainer: HTMLElement | OverlayRef | (() => HTMLElement | OverlayRef) = () => this.overlay.create();

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

    // [NOTE] NOT available when using by service!
    // Because ngOnChanges never be called when using by service,
    // here we can't support "kbqContent"(Component) etc. as inputs that initialized dynamically.
    // BUT: User also can change "kbqContent" dynamically to trigger UI changes
    // (provided you don't use Component that needs initializations)
    ngOnChanges(changes: SimpleChanges) {
        if (changes.kbqVisible) {
            // Do not trigger animation while initializing
            this.handleVisibleStateChange(this.kbqVisible, !changes.kbqVisible.firstChange);
        }
    }

    ngAfterViewInit() {
        // If using Component, it is the time to attach View while bodyContainer is ready
        if (this.contentComponentRef) {
            this.bodyContainer.insert(this.contentComponentRef.hostView);
        }
        this.getElement().getElementsByTagName('button')[0]?.focus();

        (this.getElement().querySelector('button[autofocus]') as HTMLButtonElement)?.focus();

        this.checkOverflow();
    }

    ngOnDestroy() {
        if (this.container instanceof OverlayRef) {
            this.container.dispose();
        }
    }

    checkOverflow(): void {
        const nativeElement = this.modalBody?.nativeElement;

        if (!nativeElement) { return; }

        const scrollTop: number = nativeElement.scrollTop;
        const offsetHeight: number = nativeElement.offsetHeight;
        const scrollHeight: number = nativeElement.scrollHeight;

        this.isTopOverflow = scrollTop > 0;

        this.isBottomOverflow = (scrollTop as number + offsetHeight as number) < scrollHeight;
    }

    open() {
        this.focusedElementBeforeOpen = this.document.activeElement;
        this.previouslyFocusedElementOrigin = this.focusMonitor['_lastFocusOrigin'];

        this.focusMonitor.monitor(this.modalContainer, true)
            .pipe(take(1))
            .subscribe(() => this.focusMonitor.stopMonitoring(this.modalContainer));

        this.changeVisibleFromInside(true);
    }

    close(result?: R) {
        this.changeVisibleFromInside(false, result)
            .then(() => {
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
        if (
            this.kbqMask &&
            this.kbqMaskClosable &&
            ($event.target as HTMLElement).classList.contains('kbq-modal-wrap') &&
            this.kbqVisible
        ) {
            this.onClickOkCancel('cancel');
        }
    }

    // tslint:disable-next-line: no-reserved-keywords
    isModalType(type: ModalType): boolean {
        return this.kbqModalType === type;
    }

    onKeyDown(event: KeyboardEvent): void {

        // tslint:disable-next-line:deprecation .key isn't supported in Edge
        if (event.keyCode === ESCAPE && this.container && (this.container instanceof OverlayRef)) {

            this.close();
            event.preventDefault();
        }
        // tslint:disable-next-line:deprecation .key isn't supported in Edge
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
    // tslint:disable-next-line: no-reserved-keywords
    onClickOkCancel(type: 'ok' | 'cancel') {
        this.handleCloseResult(type, (doClose) => doClose !== false);
    }

    handleCloseResult(
        triggerType: 'ok' | 'cancel',
        canClose: (doClose: boolean | void | {}) => boolean
    ) {
        const trigger = { ok: this.kbqOnOk, cancel: this.kbqOnCancel }[triggerType];
        const loadingKey = { ok: 'kbqOkLoading', cancel: 'kbqCancelLoading' }[triggerType];

        if (trigger instanceof EventEmitter) {
            trigger.emit(this.getContentComponent());
        } else if (typeof trigger === 'function') {

            const result = trigger(this.getContentComponent());
            // Users can return "false" to prevent closing by default
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
    isNonEmptyString(value: {}): boolean {
        return typeof value === 'string' && value !== '';
    }

    // AoT
    isTemplateRef(value: {}): boolean {
        return value instanceof TemplateRef;
    }

    // AoT
    isComponent(value: {}): boolean {
        return value instanceof Type;
    }

    // AoT
    isModalButtons(value: {}): boolean {
        return Array.isArray(value) && value.length > 0;
    }

    // Lookup a button's property, if the prop is a function, call & then return the result, otherwise, return itself.
    // AoT
    getButtonCallableProp(options: IModalButtonOptions<T>, prop: string): {} {
        const value = options[prop];
        const args: any[] = [];
        if (this.contentComponentRef) {
            args.push(this.contentComponentRef.instance);
        }

        return typeof value === 'function' ? value.apply(options, args) : value;
    }

    // On kbqFooter's modal button click
    // AoT
    onButtonClick(button: IModalButtonOptions<T>) {
        // Call onClick directly
        // tslint:disable-next-line:no-inferred-empty-object-type  rule seems to be broken
        const result = this.getButtonCallableProp(button, 'onClick');
        if (isPromise(result)) {
            button.loading = true;
            (result as Promise<{}>).then(() => button.loading = false).catch(() => button.loading = false);
        }
    }

    // Do rest things when visible state changed
    private handleVisibleStateChange(visible: boolean, animation: boolean = true, closeResult?: R): Promise<any> {
        // Hide scrollbar at the first time when shown up
        if (visible) {
            this.changeBodyOverflow(1);
        }

        return Promise
            .resolve(animation && this.animateTo(visible))
            // Emit open/close event after animations over
            .then(() => {
                if (visible) {
                    this.kbqAfterOpen.emit();
                } else {
                    this.kbqAfterClose.emit(closeResult);
                    // Show/hide scrollbar when animation is over
                    this.changeBodyOverflow();
                }
            });
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
        if (state) {
            this.maskAnimationClassMap = {
                [`fade-${state}`]: true,
                [`fade-${state}-active`]: true
            };

            this.modalAnimationClassMap = {
                [`zoom-${state}`]: true,
                [`zoom-${state}-active`]: true
            };
        } else {
            // @ts-ignore
            this.maskAnimationClassMap = this.modalAnimationClassMap = null;
        }

        if (this.contentComponentRef) {
            this.contentComponentRef.changeDetectorRef.markForCheck();
        } else {
            this.changeDetector.markForCheck();
        }
    }

    private animateTo(isVisible: boolean): Promise<any> {
        // Figure out the latest click position when shows up
        if (isVisible) {
            // [NOTE] Using timeout due to the document.click event is fired later than visible change,
            // so if not postponed to next event-loop, we can't get the latest click position
            window.setTimeout(() => this.updateTransformOrigin());
        }

        this.changeAnimationState(isVisible ? 'enter' : 'leave');

        // Return when animation is over
        return new Promise((resolve) => {
            return window.setTimeout(
                () => {
                    this.changeAnimationState(null);
                    resolve(null);
                },
                MODAL_ANIMATE_DURATION
            );
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
        const factory = this.cfr.resolveComponentFactory(component);
        const childInjector = Injector.create({
            providers: [{provide: KbqModalRef, useValue: this}],
            parent: this.viewContainer.injector
        });

        this.contentComponentRef = factory.create(childInjector);

        if (this.kbqComponentParams) {
            // @ts-ignore
            Object.assign(this.contentComponentRef.instance, this.kbqComponentParams);
        }

        // Do the first change detection immediately
        // (or we do detection at ngAfterViewInit, multi-changes error will be thrown)
        this.contentComponentRef.changeDetectorRef.detectChanges();
    }

    // Update transform-origin to the last click position on document
    private updateTransformOrigin() {
        const modalElement = this.modalContainer.nativeElement as HTMLElement;
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

////////////

function isPromise(obj: {} | void): boolean {
    // tslint:disable-next-line: no-unbound-method
    return !!obj &&
        (typeof obj === 'object' || typeof obj === 'function') &&
        typeof (obj as Promise<{}>).then === 'function' &&
        typeof (obj as Promise<{}>).catch === 'function';
}
