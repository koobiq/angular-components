import { CdkMonitorFocus } from '@angular/cdk/a11y';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    contentChildren,
    effect,
    forwardRef,
    inject,
    InjectionToken,
    input,
    model,
    signal,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    DOWN_ARROW,
    isHorizontalMovement,
    isVerticalMovement,
    KBQ_LOCALE_SERVICE,
    KbqNavbarLocaleConfiguration,
    ruRULocaleData,
    TAB,
    UP_ARROW
} from '@koobiq/components/core';
import { Subject } from 'rxjs';
import { KbqNavbarBento, KbqNavbarItem, KbqNavbarRectangleElement } from './navbar-item.component';
import { KbqFocusableComponent } from './navbar.component';

/** Localizable strings of the vertical navbar. */
export type KbqVerticalNavbarConfiguration = KbqNavbarLocaleConfiguration;

/** default configuration of navbar */
/** @docs-private */
export const KBQ_VERTICAL_NAVBAR_DEFAULT_CONFIGURATION: KbqNavbarLocaleConfiguration = ruRULocaleData.navbar;

/** Injection Token for providing configuration of navbar */
/** @docs-private */
export const KBQ_VERTICAL_NAVBAR_CONFIGURATION = new InjectionToken<KbqNavbarLocaleConfiguration>(
    'KbqVerticalNavbarConfiguration'
);

@Component({
    selector: 'kbq-vertical-navbar',
    template: `
        <div
            class="kbq-vertical-navbar__container"
            [class.kbq-collapsed]="!expanded()"
            [class.kbq-expanded]="expanded()"
        >
            <ng-content select="[kbq-navbar-container], kbq-navbar-container" />
            <ng-content select="[kbq-navbar-toggle], kbq-navbar-toggle" />
        </div>
    `,
    styleUrls: [
        './vertical-navbar.scss',
        './navbar-item.scss',
        './navbar-brand.scss',
        './navbar-divider.scss',
        './navbar-tokens.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-vertical-navbar',
        role: 'navigation',
        '[attr.aria-label]': 'ariaLabel()',
        '[class.kbq-vertical-navbar_open-over]': 'openOver()',
        '[attr.tabindex]': 'tabIndex()',
        '[attr.cdkMonitorSubtreeFocus]': 'true',

        '(focus)': 'focus()',
        '(blur)': 'blur()',

        '(keydown)': 'onKeyDown($event)'
    },
    hostDirectives: [CdkMonitorFocus],
    exportAs: 'KbqVerticalNavbar'
})
export class KbqVerticalNavbar extends KbqFocusableComponent implements AfterContentInit {
    /** @docs-private */
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });

    /** Configuration provided through `KBQ_VERTICAL_NAVBAR_CONFIGURATION`, when any. @docs-private */
    readonly externalConfiguration = inject(KBQ_VERTICAL_NAVBAR_CONFIGURATION, { optional: true });

    /**
     * Localizable strings of the navbar.
     *
     * A signal so that a locale change reaches the `OnPush` descendants that render these strings — a plain
     * field would leave them showing the previous locale until something else marked them dirty.
     *
     * Seeded here rather than from the locale subscription alone: the locale service is optional, and without
     * it an externally provided configuration would never be applied at all.
     */
    readonly configuration = signal<KbqNavbarLocaleConfiguration>(
        this.externalConfiguration || KBQ_VERTICAL_NAVBAR_DEFAULT_CONFIGURATION
    );

    /** @docs-private */
    readonly rectangleElements = contentChildren<KbqNavbarRectangleElement>(
        forwardRef(() => KbqNavbarRectangleElement),
        { descendants: true }
    );

    /** @docs-private */
    readonly items = contentChildren<KbqNavbarItem>(
        forwardRef(() => KbqNavbarItem),
        { descendants: true }
    );

    /** @docs-private */
    readonly bento = contentChild<KbqNavbarBento>(forwardRef(() => KbqNavbarBento));

    /** @docs-private */
    readonly animationDone: Subject<void> = new Subject();

    /** Whether the expanded navbar overlays the page content instead of taking room from it. */
    readonly openOver = input<boolean>(false);

    /** Whether the navbar is expanded. */
    readonly expanded = model<boolean>(false);

    constructor() {
        super();

        this.destroyRef.onDestroy(() => this.animationDone.complete());

        this.animationDone.pipe(takeUntilDestroyed()).subscribe(this.updateTooltipForItems);

        effect(() => {
            // Re-runs both when the projected elements change and when the navbar is expanded or collapsed.
            const expanded = this.expanded();

            this.rectangleElements().forEach((item) => {
                item.orientation = 'vertical';
                item.collapsed = !expanded;
            });

            this.refreshButtonIcons();
        });

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);
    }

    /** @docs-private */
    ngAfterContentInit(): void {
        this.updateTooltipForItems();

        super.ngAfterContentInit();

        this.keyManager.withVerticalOrientation(true);
    }

    /** Expands a collapsed navbar and collapses an expanded one. */
    toggle(): void {
        this.expanded.set(!this.expanded());
    }

    /** @docs-private */
    protected onKeyDown(event: KeyboardEvent) {
        const keyCode = event.keyCode;

        if (
            !(event.target as HTMLElement).attributes.getNamedItem('kbqinput') &&
            (isVerticalMovement(event) || isHorizontalMovement(event))
        ) {
            event.preventDefault();
        }

        if (keyCode === TAB) {
            this.keyManager.tabOut.next();

            return;
        } else if (keyCode === DOWN_ARROW) {
            this.keyManager.setNextItemActive();
        } else if (keyCode === UP_ARROW) {
            this.keyManager.setPreviousItemActive();
        } else {
            this.keyManager.onKeydown(event);
        }
    }

    private updateTooltipForItems = () => this.items().forEach((item) => item.updateTooltip());

    /**
     * Buttons projected into the items re-pick their icon-only modifier from the rendered width, so the pass
     * has to wait for the collapsed/expanded classes to reach the DOM. One deferred pass over every item, not
     * one timer per item.
     */
    private refreshButtonIcons(): void {
        const elements = this.rectangleElements();

        if (!elements.length) return;

        const timeoutId = setTimeout(() => elements.forEach((item) => item.button()?.updateClassModifierForIcons()));

        this.destroyRef.onDestroy(() => clearTimeout(timeoutId));
    }

    private updateLocaleParams = () => {
        this.configuration.set(
            this.externalConfiguration ??
                this.localeService?.getParams('navbar') ??
                KBQ_VERTICAL_NAVBAR_DEFAULT_CONFIGURATION
        );
    };
}
