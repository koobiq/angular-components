import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    Directive,
    ElementRef,
    forwardRef,
    Input,
    numberAttribute,
    OnDestroy,
    QueryList,
    Renderer2,
    SkipSelf,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    getNodesWithoutComments,
    KBQ_TITLE_TEXT_REF,
    KbqColorDirective,
    KbqComponentColors,
    KbqTitleTextRef,
    leftIconClassName,
    rightIconClassName
} from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';

export enum KbqButtonStyles {
    Filled = 'filled',
    Outline = 'outline',
    Transparent = 'transparent'
}

export const buttonLeftIconClassName = 'kbq-button-icon_left';
export const buttonRightIconClassName = 'kbq-button-icon_right';

@Directive({
    selector: '[kbq-button]',
    host: {
        '[class.kbq-button]': '!isIconButton',
        '[class.kbq-button-icon]': 'isIconButton'
    }
})
export class KbqButtonCssStyler implements AfterContentInit {
    @ContentChildren(forwardRef(() => KbqIcon)) icons: QueryList<KbqIcon>;

    nativeElement: HTMLElement;

    isIconButton: boolean = false;

    constructor(
        elementRef: ElementRef,
        private renderer: Renderer2,
        @SkipSelf() private cdr: ChangeDetectorRef
    ) {
        this.nativeElement = elementRef.nativeElement;
    }

    ngAfterContentInit() {
        this.updateClassModifierForIcons();
    }

    updateClassModifierForIcons() {
        this.renderer.removeClass(this.nativeElement, buttonLeftIconClassName);
        this.renderer.removeClass(this.nativeElement, buttonRightIconClassName);
        this.icons
            .map((item) => item.getHostElement())
            .forEach((iconHostElement) => {
                this.renderer.removeClass(iconHostElement, leftIconClassName);
                this.renderer.removeClass(iconHostElement, rightIconClassName);
            });

        const twoIcons = 2;
        const filteredNodesWithoutComments = getNodesWithoutComments(
            this.nativeElement.querySelector('.kbq-button-wrapper')!.childNodes as NodeList
        );

        const currentIsIconButtonValue =
            !!this.icons.length &&
            this.icons.length === filteredNodesWithoutComments.length &&
            this.icons.length <= twoIcons;

        if (currentIsIconButtonValue !== this.isIconButton) {
            this.isIconButton = currentIsIconButtonValue;
            this.cdr.detectChanges();
        }

        if (this.icons.length && filteredNodesWithoutComments.length > 1) {
            this.icons
                .map((item) => item.getHostElement())
                .forEach((iconHostElement) => {
                    const iconIndex = filteredNodesWithoutComments.findIndex((node) => node === iconHostElement);

                    if (iconIndex === 0) {
                        this.renderer.addClass(iconHostElement, leftIconClassName);
                        this.renderer.addClass(this.nativeElement, buttonLeftIconClassName);
                    }

                    if (iconIndex === filteredNodesWithoutComments.length - 1) {
                        this.renderer.addClass(iconHostElement, rightIconClassName);
                        this.renderer.addClass(this.nativeElement, buttonRightIconClassName);
                    }
                });
        }
    }
}

@Component({
    selector: '[kbq-button]',
    templateUrl: './button.component.html',
    styleUrls: ['./button.scss', './button-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[attr.disabled]': 'disabled || null',
        '[class.kbq-disabled]': 'disabled',
        '[attr.tabIndex]': 'tabIndex',
        '[class]': 'kbqStyle',

        '(focus)': 'onFocus($event)',
        '(blur)': 'onBlur()'
    },
    providers: [
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqButton }]
})
export class KbqButton extends KbqColorDirective implements OnDestroy, AfterViewInit, KbqTitleTextRef {
    hasFocus: boolean = false;

    @ViewChild('kbqTitleText', { static: false }) textElement: ElementRef;

    @Input()
    get kbqStyle(): string {
        return `kbq-button_${this._kbqStyle}`;
    }

    set kbqStyle(value: string | KbqButtonStyles) {
        this._kbqStyle = value || KbqButtonStyles.Filled;
    }

    private _kbqStyle: string | KbqButtonStyles = KbqButtonStyles.Filled;

    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;

        this._disabled ? this.stopFocusMonitor() : this.runFocusMonitor();
    }

    private _disabled: boolean = false;

    @Input({ transform: numberAttribute })
    get tabIndex(): number {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: number) {
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    constructor(
        private focusMonitor: FocusMonitor,
        private styler: KbqButtonCssStyler
    ) {
        super();

        this.color = KbqComponentColors.ContrastFade;
        this.setDefaultColor(KbqComponentColors.ContrastFade);
    }

    ngAfterViewInit(): void {
        this.runFocusMonitor();
    }

    ngOnDestroy() {
        this.stopFocusMonitor();
    }

    onFocus($event) {
        $event.stopPropagation();

        this.hasFocus = true;
    }

    onBlur() {
        this.hasFocus = false;
    }

    getHostElement() {
        return this.elementRef.nativeElement;
    }

    focus(): void {
        this.hasFocus = true;

        this.getHostElement().focus();
    }

    focusViaKeyboard(): void {
        this.hasFocus = true;

        this.focusMonitor.focusVia(this.getHostElement(), 'keyboard');
    }

    haltDisabledEvents(event: Event) {
        if (this.disabled) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
        }
    }

    projectContentChanged() {
        this.styler.updateClassModifierForIcons();
    }

    private runFocusMonitor() {
        this.focusMonitor.monitor(this.elementRef.nativeElement, true);
    }

    private stopFocusMonitor() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }
}
