import { FocusMonitor } from '@angular/cdk/a11y';
import { CdkObserveContent } from '@angular/cdk/observers';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    contentChildren,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    Input,
    isDevMode,
    numberAttribute,
    OnDestroy,
    Renderer2,
    signal,
    untracked,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    DOWN_ARROW,
    ENTER,
    getNodesWithoutComments,
    KBQ_TITLE_TEXT_REF,
    KbqColorDirective,
    KbqComponentColors,
    KbqTitleTextRef,
    LEFT_ARROW,
    leftIconClassName,
    RIGHT_ARROW,
    rightIconClassName,
    SPACE
} from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';

export enum KbqButtonStyles {
    Filled = 'filled',
    Outline = 'outline',
    Transparent = 'transparent'
}

export const buttonLeftIconClassName = 'kbq-button-icon_left';
export const buttonRightIconClassName = 'kbq-button-icon_right';

/** A button containing more icons than this keeps regular (non icon-button) styling. */
const maxIconsForIconButton = 2;

/**
 * Applies the `kbq-button`/`kbq-button-icon` host class and the left/right icon modifier classes.
 *
 * A button is treated as an icon button when its projected content consists only of `KbqIcon`s
 * and there are at most 2 of them. When icons are mixed with other content, only the outermost
 * icons receive the left/right classes.
 *
 * Must be used together with `KbqButton` (both match `[kbq-button]`): icon detection relies on
 * the `.kbq-button-wrapper` element rendered by the component's template.
 */
@Directive({
    selector: '[kbq-button]',
    host: {
        '[class.kbq-button]': '!isIconButton',
        '[class.kbq-button-icon]': 'isIconButton'
    }
})
export class KbqButtonCssStyler implements AfterContentInit {
    private renderer = inject(Renderer2);

    readonly icons = contentChildren(forwardRef(() => KbqIcon));

    nativeElement: HTMLElement;

    /** Whether the button contains only icons (at most 2). */
    get isIconButton(): boolean {
        return this._isIconButton();
    }

    private readonly _isIconButton = signal(false);

    private leftIcon: HTMLElement | null = null;
    private rightIcon: HTMLElement | null = null;

    constructor() {
        const elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

        this.nativeElement = elementRef.nativeElement;

        // The contentChildren query tracks only KbqIcon instances, while icon placement also
        // depends on sibling text nodes that are invisible to the query — those are covered by
        // the MutationObserver in the component template. This effect covers icon creation and
        // removal (e.g. via @if) while the observer is disabled for icon-less buttons.
        effect(() => {
            this.icons();

            untracked(() => this.updateClassModifierForIcons());
        });
    }

    ngAfterContentInit() {
        this.updateClassModifierForIcons();
    }

    updateClassModifierForIcons() {
        const wrapper = this.nativeElement.querySelector('.kbq-button-wrapper');

        if (!wrapper) {
            if (isDevMode()) {
                // eslint-disable-next-line no-console
                console.warn('KbqButtonCssStyler should be imported together with KbqButton.');
            }

            return;
        }

        const icons = this.icons();
        const textElement = wrapper.querySelector('.kbq-button-text');

        // Build an ordered list of "effective" content nodes: the left-slot content, then the
        // default-slot content flattened out of `.kbq-button-text`, then the right-slot content.
        // Flattening the text span keeps legacy `<i kbq-icon> Text` markup (projected into the
        // default slot) working: those icons live inside `.kbq-button-text`, but for placement
        // they must be treated as direct siblings of the text, exactly as before the text span
        // existed. With no marker slots this list equals the old wrapper children.
        const effectiveNodes: Node[] = [];

        for (const node of getNodesWithoutComments(wrapper.childNodes)) {
            if (node === textElement) {
                effectiveNodes.push(...getNodesWithoutComments((node as HTMLElement).childNodes));
            } else {
                effectiveNodes.push(node);
            }
        }

        this._isIconButton.set(
            !!icons.length && icons.length === effectiveNodes.length && icons.length <= maxIconsForIconButton
        );

        let leftIcon: HTMLElement | null = null;
        let rightIcon: HTMLElement | null = null;

        if (icons.length && effectiveNodes.length > 1) {
            for (const icon of icons) {
                const iconHostElement = icon.getHostElement();
                const iconIndex = effectiveNodes.indexOf(iconHostElement);

                if (iconIndex === 0) leftIcon = iconHostElement;

                if (iconIndex === effectiveNodes.length - 1) rightIcon = iconHostElement;
            }
        }

        this.updateIconClass(this.leftIcon, leftIcon, leftIconClassName, buttonLeftIconClassName);
        this.updateIconClass(this.rightIcon, rightIcon, rightIconClassName, buttonRightIconClassName);

        this.leftIcon = leftIcon;
        this.rightIcon = rightIcon;
    }

    private updateIconClass(
        previous: HTMLElement | null,
        current: HTMLElement | null,
        iconClassName: string,
        buttonClassName: string
    ) {
        if (previous === current) return;

        if (previous) {
            this.renderer.removeClass(previous, iconClassName);
        }

        if (current) {
            this.renderer.addClass(current, iconClassName);
            this.renderer.addClass(this.nativeElement, buttonClassName);
        } else {
            this.renderer.removeClass(this.nativeElement, buttonClassName);
        }
    }
}

@Component({
    selector: '[kbq-button]',
    imports: [
        CdkObserveContent
    ],
    templateUrl: './button.component.html',
    styleUrls: ['./button.scss', './button-tokens.scss'],
    providers: [
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqButton }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[attr.disabled]': 'disabled || null',
        '[attr.aria-disabled]': 'disabled || null',
        '[class.kbq-disabled]': 'disabled',
        '[attr.tabIndex]': 'tabIndex',
        '[class]': 'kbqStyle',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()'
    }
})
export class KbqButton extends KbqColorDirective implements OnDestroy, AfterViewInit, KbqTitleTextRef {
    private focusMonitor = inject(FocusMonitor);
    protected styler = inject(KbqButtonCssStyler);

    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    hasFocus: boolean = false;

    @ViewChild('kbqTitleText') textElement: ElementRef<HTMLElement>;

    /** The flex row that lays out the icons and text, used as the overflow width constraint. */
    @ViewChild('parentTextElement') parentTextElement: ElementRef<HTMLElement>;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get kbqStyle(): string {
        return `kbq-button_${this._kbqStyle}`;
    }

    set kbqStyle(value: string | KbqButtonStyles) {
        this._kbqStyle = value || KbqButtonStyles.Filled;

        this.changeDetectorRef.markForCheck();
    }

    private _kbqStyle: string | KbqButtonStyles = KbqButtonStyles.Filled;

    // @todo 20 In the next major release this feature will be replaced on the input signal.
    /** Whether the button is disabled. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this.disabledSignal();
    }

    set disabled(value: boolean) {
        this.disabledSignal.set(value);
    }

    /** @docs-private */
    readonly disabledSignal = signal(false);

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: numberAttribute })
    get tabIndex(): number {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: number) {
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    constructor() {
        super();

        this.color = KbqComponentColors.ContrastFade;
        this.setDefaultColor(KbqComponentColors.ContrastFade);

        // Native capture-phase listeners instead of host listeners: Angular coalesces listeners
        // for the same event on the same element, so stopImmediatePropagation from a host listener
        // would not stop consumer-bound handlers. Matters for <a kbq-button> hosts only —
        // a disabled native <button> does not emit these events at all. The keydown guard covers
        // directives that activate on keydown directly (e.g. KbqDropdownTrigger, which opens on
        // ENTER/SPACE and on DOWN/LEFT/RIGHT arrows).
        this.getHostElement().addEventListener('click', this.haltDisabledEvents, true);
        this.getHostElement().addEventListener('keydown', this.haltDisabledKeydownEvents, true);
    }

    ngAfterViewInit(): void {
        this.runFocusMonitor();
    }

    ngOnDestroy() {
        this.getHostElement().removeEventListener('click', this.haltDisabledEvents, true);
        this.getHostElement().removeEventListener('keydown', this.haltDisabledKeydownEvents, true);
        this.stopFocusMonitor();
    }

    onFocus() {
        this.hasFocus = true;
    }

    onBlur() {
        this.hasFocus = false;
    }

    getHostElement() {
        return this.elementRef.nativeElement;
    }

    focus(): void {
        if (this.disabled) return;

        this.getHostElement().focus();
    }

    focusViaKeyboard(): void {
        if (this.disabled) return;

        this.focusMonitor.focusVia(this.getHostElement(), 'keyboard');
    }

    haltDisabledEvents = (event: Event) => {
        if (this.disabled) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
        }
    };

    private haltDisabledKeydownEvents = (event: KeyboardEvent) => {
        // Keys that activate sibling host directives on the same host (e.g. KbqDropdownTrigger opens
        // on ENTER/SPACE and on DOWN/LEFT/RIGHT arrows). Tab/Escape are intentionally left untouched
        // so focus can still move away from a disabled — but still focusable — <a kbq-button> host.
        if ([ENTER, SPACE, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW].includes(event.keyCode)) {
            this.haltDisabledEvents(event);
        }
    };

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
