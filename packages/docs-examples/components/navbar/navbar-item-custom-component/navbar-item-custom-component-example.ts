import { ChangeDetectionStrategy, Component, forwardRef, viewChild } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButton, KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KBQ_NAVBAR_ITEM_TRIGGER, KbqNavbarItemTrigger, KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { injectExampleText } from '../localized-data';

/**
 * A custom interactive component: it owns a popover and the item's keyboard focus, so the navbar item
 * delegates interaction to it instead of acting as a button itself.
 */
@Component({
    selector: 'example-navbar-notifications',
    imports: [KbqBadgeModule, KbqButtonModule, KbqIconModule, KbqPopoverModule],
    template: `
        <button
            kbq-button
            kbqPopover
            class="example-navbar-notifications__trigger"
            [tabIndex]="-1"
            [kbqPopoverContent]="'Body of the notifications center'"
            [kbqPopoverHeader]="text().notifications"
            [kbqPopoverPlacement]="popUpPlacements.Right"
        >
            <i kbq-icon="kbq-bell_16" color="contrast"></i>
            <kbq-badge class="example-navbar-notifications__badge" [badgeColor]="'error'" [compact]="true">2</kbq-badge>
        </button>
    `,
    styleUrl: 'navbar-item-custom-component-example.scss',
    providers: [{ provide: KBQ_NAVBAR_ITEM_TRIGGER, useExisting: forwardRef(() => ExampleNavbarNotifications) }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleNavbarNotifications implements KbqNavbarItemTrigger {
    protected readonly text = injectExampleText();

    protected readonly popUpPlacements = PopUpPlacements;

    private readonly button = viewChild(KbqButton);

    get hasFocus(): boolean {
        return this.button()?.hasFocus ?? false;
    }

    focus(): void {
        this.button()?.focus();
    }

    focusViaKeyboard(): void {
        this.button()?.focusViaKeyboard();
    }
}

/**
 * @title Navbar item with a custom interactive component
 */
@Component({
    selector: 'navbar-item-custom-component-example',
    imports: [KbqIconModule, KbqNavbarModule, ExampleNavbarNotifications],
    templateUrl: 'navbar-item-custom-component-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarItemCustomComponentExample {
    protected readonly text = injectExampleText();
}
