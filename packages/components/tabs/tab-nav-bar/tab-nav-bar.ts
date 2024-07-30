import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    AfterViewInit,
    Attribute,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    ElementRef,
    Input,
    OnDestroy,
    QueryList,
    Renderer2,
    ViewEncapsulation
} from '@angular/core';
import {
    CanDisable,
    CanDisableCtor,
    HasTabIndex,
    HasTabIndexCtor,
    mixinDisabled,
    mixinTabIndex
} from '@koobiq/components/core';
import { delay } from 'rxjs/operators';

// Boilerplate for applying mixins to KbqTabLink.
/** @docs-private */
export class KbqTabLinkBase {}

/** @docs-private */
export const KbqTabLinkMixinBase: HasTabIndexCtor & CanDisableCtor & typeof KbqTabLinkBase = mixinTabIndex(
    mixinDisabled(KbqTabLinkBase)
);

/**
 * Link inside of a `kbq-tab-nav-bar`.
 */
@Component({
    selector: 'a[kbq-tab-link], a[kbqTabLink]',
    exportAs: 'kbqTabLink',
    template: '<ng-content />',
    inputs: ['disabled', 'tabIndex'],
    host: {
        class: 'kbq-tab-link',
        '[class.kbq-selected]': 'active',
        '[class.kbq-tab-label_vertical]': 'vertical',
        '[class.kbq-tab-label_horizontal]': '!vertical',
        '[class.kbq-disabled]': 'disabled',

        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null'
    }
})
export class KbqTabLink extends KbqTabLinkMixinBase implements OnDestroy, CanDisable, HasTabIndex, AfterViewInit {
    vertical = false;

    /** Whether the link is active. */
    @Input()
    get active(): boolean {
        return this.isActive;
    }

    set active(value: boolean) {
        if (value !== this.isActive) {
            this.isActive = value;
        }
    }

    /** Whether the tab link is active or not. */
    protected isActive: boolean = false;

    constructor(
        public elementRef: ElementRef,
        private readonly focusMonitor: FocusMonitor,
        private readonly renderer: Renderer2
    ) {
        super();

        this.focusMonitor.monitor(this.elementRef.nativeElement);
    }

    ngAfterViewInit(): void {
        this.addClassModifierForIcons(Array.from(this.elementRef.nativeElement.querySelectorAll('.kbq-icon')));
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    private addClassModifierForIcons(icons: HTMLElement[]) {
        const twoIcons = 2;
        const [firstIconElement, secondIconElement] = icons;

        if (icons.length === 1) {
            const COMMENT_NODE = 8;

            if (firstIconElement.nextSibling && firstIconElement.nextSibling.nodeType !== COMMENT_NODE) {
                this.renderer.addClass(firstIconElement, 'kbq-icon_left');
            }

            if (firstIconElement.previousSibling && firstIconElement.previousSibling.nodeType !== COMMENT_NODE) {
                this.renderer.addClass(firstIconElement, 'kbq-icon_right');
            }
        } else if (icons.length === twoIcons) {
            this.renderer.addClass(firstIconElement, 'kbq-icon_left');
            this.renderer.addClass(secondIconElement, 'kbq-icon_right');
        }
    }
}

/**
 * Navigation component matching the styles of the tab group header.
 */
@Component({
    selector: '[kbq-tab-nav-bar]',
    exportAs: 'kbqTabNavBar, kbqTabNav',
    template: '<ng-content />',
    styleUrls: ['tab-nav-bar.scss'],
    host: {
        class: 'kbq-tab-nav-bar',
        '[class.kbq-tab-nav-bar_filled]': '!transparent',
        '[class.kbq-tab-nav-bar_transparent]': 'transparent',
        '[class.kbq-tab-nav-bar_on-background]': '!onSurface',
        '[class.kbq-tab-nav-bar_on-surface]': 'onSurface'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTabNav implements AfterContentInit {
    vertical = false;

    @Input() transparent: boolean = false;
    @Input() onSurface: boolean = false;

    @ContentChildren(KbqTabLink) links: QueryList<KbqTabLink>;

    constructor(@Attribute('vertical') vertical: string) {
        this.vertical = coerceBooleanProperty(vertical);
    }

    ngAfterContentInit(): void {
        this.links.changes
            .pipe(delay(0))
            .subscribe((links) => links.forEach((link) => (link.vertical = this.vertical)));

        this.links.notifyOnChanges();
    }
}
