import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    contentChildren,
    effect,
    ElementRef,
    forwardRef,
    inject,
    InjectionToken,
    Input,
    input,
    Provider,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    DOWN_ARROW,
    isHorizontalMovement,
    isVerticalMovement,
    KbqDeepPartial,
    kbqInjectLocaleConfiguration,
    kbqLocaleConfigurationOverrideProvider,
    KbqNavbarLocaleConfiguration,
    ruRULocaleData,
    TAB,
    UP_ARROW
} from '@koobiq/components/core';
import { Subject } from 'rxjs';
import { KbqNavbarBento, KbqNavbarItem, KbqNavbarRectangleElement } from './navbar-item.component';
import { KbqFocusableComponent } from './navbar.component';

/** default configuration of navbar */
/** @docs-private */
export const KBQ_VERTICAL_NAVBAR_DEFAULT_CONFIGURATION = ruRULocaleData.navbar;

/** Injection Token for providing configuration of navbar */
/** @docs-private */
export const KBQ_VERTICAL_NAVBAR_CONFIGURATION = new InjectionToken<KbqNavbarLocaleConfiguration>(
    'KbqVerticalNavbarConfiguration',
    { factory: () => KBQ_VERTICAL_NAVBAR_DEFAULT_CONFIGURATION }
);

/**
 * Utility provider for `KBQ_VERTICAL_NAVBAR_CONFIGURATION`. Only the strings you pass are overridden; the
 * rest keep following the active locale.
 */
export const kbqVerticalNavbarLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqNavbarLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('navbar', configuration);

@Component({
    selector: 'kbq-vertical-navbar',
    template: `
        <div class="kbq-vertical-navbar__container" [class.kbq-collapsed]="!expanded" [class.kbq-expanded]="expanded">
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
        '[class.kbq-vertical-navbar_open-over]': 'openOver()',
        '[attr.tabindex]': 'tabIndex',
        '[attr.cdkMonitorSubtreeFocus]': 'true',

        '(focus)': 'focus()',
        '(blur)': 'blur()',

        '(keydown)': 'onKeyDown($event)'
    },
    hostDirectives: [CdkMonitorFocus],
    exportAs: 'KbqVerticalNavbar'
})
export class KbqVerticalNavbar extends KbqFocusableComponent implements AfterContentInit {
    protected elementRef: ElementRef<HTMLElement>;

    /**
     * Localized strings of the collapse toggle.
     *
     * A getter over the signal the helper returns, so that a runtime `setLocale()` stays observable from
     * outside this component: `KbqNavbarToggle` reads it in an `effect` to refresh its tooltip, which a
     * `markForCheck()` here could never have reached in that separate `OnPush` view.
     */
    get configuration(): KbqNavbarLocaleConfiguration {
        return this._configuration();
    }

    private readonly _configuration = kbqInjectLocaleConfiguration('navbar', KBQ_VERTICAL_NAVBAR_CONFIGURATION);

    rectangleElements = contentChildren(
        forwardRef(() => KbqNavbarRectangleElement),
        { descendants: true }
    );

    readonly items = contentChildren(
        forwardRef(() => KbqNavbarItem),
        { descendants: true }
    );

    readonly bento = contentChild(forwardRef(() => KbqNavbarBento));

    readonly animationDone: Subject<void> = new Subject();

    readonly openOver = input<boolean>(false);

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get expanded() {
        return this._expanded;
    }

    set expanded(value: boolean) {
        this._expanded = coerceBooleanProperty(value);

        this.updateExpandedStateForItems();
    }

    private _expanded: boolean = false;

    constructor() {
        const elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

        super();
        this.elementRef = elementRef;

        this.animationDone.pipe(takeUntilDestroyed()).subscribe(this.updateTooltipForItems);

        effect(() => this.setItemsVerticalStateAndUpdateExpandedState(this.rectangleElements()));
    }

    ngAfterContentInit(): void {
        this.updateTooltipForItems();

        super.ngAfterContentInit();

        this.keyManager.withVerticalOrientation(true);
    }

    toggle(): void {
        this.expanded = !this.expanded;

        this.changeDetectorRef.markForCheck();
    }

    onKeyDown(event: KeyboardEvent) {
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

    private updateExpandedStateForItems = () => this.rectangleElements().forEach(this.updateItemExpandedState);

    private updateTooltipForItems = () => this.items().forEach((item) => item.updateTooltip());

    private setItemsVerticalStateAndUpdateExpandedState = (rectangleElements: Readonly<KbqNavbarRectangleElement[]>) =>
        rectangleElements.forEach(this.setItemVerticalStateAndUpdateExpandedState);

    private setItemVerticalStateAndUpdateExpandedState = (item: KbqNavbarRectangleElement): void => {
        queueMicrotask(() => this.setItemVerticalState(item));
        this.updateItemExpandedState(item);
    };

    private setItemVerticalState = (item: KbqNavbarRectangleElement): void => {
        item.vertical = true;
    };

    private updateItemExpandedState = (item: KbqNavbarRectangleElement): void => {
        item.collapsed = !this.expanded;
        setTimeout(() => item.button()?.updateClassModifierForIcons());
    };
}
