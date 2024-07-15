import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    Directive,
    ElementRef,
    forwardRef,
    Input,
    OnDestroy,
    QueryList,
    Renderer2,
    SkipSelf,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    CanColor,
    CanColorCtor,
    CanDisable,
    HasTabIndexCtor,
    KBQ_TITLE_TEXT_REF,
    KbqComponentColors,
    KbqTitleTextRef,
    mixinColor,
    mixinTabIndex,
} from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';

export enum KbqButtonStyles {
    Filled = 'filled',
    Outline = 'outline',
    Transparent = 'transparent',
}

export const leftIconClassName = 'kbq-icon_left';
export const rightIconClassName = 'kbq-icon_right';

export const buttonLeftIconClassName = 'kbq-button-icon_left';
export const buttonRightIconClassName = 'kbq-button-icon_right';

export const getNodesWithoutComments = (nodes: NodeList): Node[] => {
    const COMMENT_NODE = 8;

    return Array.from(nodes).filter((node) => node.nodeType !== COMMENT_NODE);
};

@Directive({
    selector: '[kbq-button]',
    host: {
        '[class.kbq-button]': '!isIconButton',
        '[class.kbq-button-icon]': 'isIconButton',
    },
})
export class KbqButtonCssStyler implements AfterContentInit {
    @ContentChildren(forwardRef(() => KbqIcon)) icons: QueryList<KbqIcon>;

    nativeElement: HTMLElement;

    isIconButton: boolean = false;

    constructor(
        elementRef: ElementRef,
        private renderer: Renderer2,
        @SkipSelf() private cdr: ChangeDetectorRef,
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
            this.nativeElement.querySelector('.kbq-button-wrapper')!.childNodes as NodeList,
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

/** @docs-private */
export class KbqButtonBase {
    constructor(public elementRef: ElementRef) {}
}

/** @docs-private */
export const KbqButtonMixinBase: HasTabIndexCtor & CanColorCtor & typeof KbqButtonBase = mixinTabIndex(
    mixinColor(KbqButtonBase, KbqComponentColors.ContrastFade),
);

@Component({
    selector: '[kbq-button]',
    templateUrl: './button.component.html',
    styleUrls: ['./button.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['color', 'tabIndex'],
    host: {
        '[attr.disabled]': 'disabled || null',
        '[class.kbq-disabled]': 'disabled',
        '[attr.tabIndex]': 'tabIndex',
        '[class]': 'kbqStyle',

        '(focus)': 'onFocus($event)',
        '(blur)': 'onBlur()',
    },
    providers: [
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqButton },
    ],
})
export class KbqButton extends KbqButtonMixinBase implements OnDestroy, CanDisable, CanColor, KbqTitleTextRef {
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

    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: any) {
        this._disabled = coerceBooleanProperty(value);

        this._disabled ? this.stopFocusMonitor() : this.runFocusMonitor();
    }

    private _disabled: boolean = false;

    constructor(
        elementRef: ElementRef,
        private focusMonitor: FocusMonitor,
        private styler: KbqButtonCssStyler,
    ) {
        super(elementRef);

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
