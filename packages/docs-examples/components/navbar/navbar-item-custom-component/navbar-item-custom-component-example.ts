import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, ElementRef, forwardRef, inject, signal } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KBQ_NAVBAR_ITEM_TRIGGER, KbqNavbarItemTrigger, KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqPopoverTrigger } from '@koobiq/components/popover';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * A custom interactive component: the host element itself is the trigger — it owns the popover and the item's
 * keyboard focus, so the navbar delegates interaction to it without a nested button.
 */
@Component({
    selector: 'example-navbar-notifications',
    imports: [KbqIconModule],
    template: `
        <i kbq-icon="kbq-bell_16" color="contrast"></i>
    `,
    providers: [{ provide: KBQ_NAVBAR_ITEM_TRIGGER, useExisting: forwardRef(() => ExampleNavbarNotifications) }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[attr.tabindex]': '-1',
        '(focus)': 'hasFocusState.set(true)',
        '(blur)': 'hasFocusState.set(false)'
    },
    hostDirectives: [
        {
            directive: KbqPopoverTrigger,
            inputs: ['kbqPopoverContent', 'kbqPopoverHeader', 'kbqPopoverPlacement']
        }
    ]
})
export class ExampleNavbarNotifications implements KbqNavbarItemTrigger {
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly focusMonitor = inject(FocusMonitor);

    protected readonly hasFocusState = signal(false);

    get hasFocus(): boolean {
        return this.hasFocusState();
    }

    focus(): void {
        this.host.nativeElement.focus();
    }

    focusViaKeyboard(): void {
        this.focusMonitor.focusVia(this.host.nativeElement, 'keyboard');
    }
}

/**
 * @title Navbar item with a custom interactive component
 */
@Component({
    selector: 'navbar-item-custom-component-example',
    imports: [KbqBadgeModule, KbqIconModule, KbqNavbarModule, ExampleNavbarNotifications],
    templateUrl: 'navbar-item-custom-component-example.html',
    styles: [
        `
            .example-navbar-item-leading {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .kbq-expanded .example-navbar-item-leading {
                justify-content: flex-start;
            }

            /* A titled item has an icon-sized leading slot, so its title starts on the plain item's text axis. */
            .example-navbar-item_compact-leading.kbq-expanded {
                --kbq-navbar-item-size-custom-content-width: var(--kbq-size-l);
                --kbq-navbar-item-size-custom-content-height: var(--kbq-size-l);
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarItemCustomComponentExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly popUpPlacements = PopUpPlacements;
}
