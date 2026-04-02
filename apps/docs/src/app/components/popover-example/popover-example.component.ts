import { CdkScrollable } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqTopBarModule } from '@koobiq/components/top-bar';

@Component({
    selector: 'docs-popover-example',
    imports: [KbqButtonModule, KbqTopBarModule, CdkScrollable, KbqPopoverModule],
    template: `
        <kbq-top-bar>
            <div
                class="layout-row layout-align-center-center layout-padding-top-3xs layout-padding-bottom-3xs kbq-title kbq-truncate-line"
                kbqTopBarContainer
                placement="start"
            >
                <span class="kbq-truncate-line">Page Title</span>
            </div>

            <div kbqTopBarSpacer></div>
        </kbq-top-bar>

        <div class="docs-text-container" cdk-scrollable>
            <p>
                A popover is a transient graphical user interface element that appears on top of the current page's
                content to present information, options, or actions related to a specific UI element, which is commonly
                referred to as the trigger. It is designed for quick, contextual interactions without permanently
                navigating away from the current view.
            </p>

            <button kbq-button kbqPopover [kbqPopoverContent]="popoverContent" [hideIfNotInViewPort]="false">
                Open popover
            </button>

            <p>
                Think of a popover as a lightweight, floating card that is directly tethered to the element that
                summoned it. Unlike a modal dialog, it does not usually block interaction with the rest of the page
                entirely, allowing for a faster and more in-context workflow. It is often activated by clicking a
                button, icon, or link, and it disappears when the user moves their focus away.
            </p>
            <p>
                The core concept of a popover revolves around its contextual and transient nature. It is directly linked
                to a specific UI element on the page, providing information or controls that are immediately relevant to
                that element. It appears temporarily and disappears when the user interacts outside of it or performs an
                action within it, meaning it does not permanently change the main view. Popovers are meant for small,
                focused interactions and should not be used for large, complex forms or displaying extensive amounts of
                information. In its most common form, a popover is non-modal, which means the user can still interact
                with the main page content while the popover is open, though some designs use a light modal scrim to
                provide stronger visual focus.
            </p>
            <p>
                Visually, a typical popover consists of several key parts that work together to create a clear and
                functional interface element. The container is a floating box with a distinct background color, a drop
                shadow to create depth, and often rounded corners. A small visual element, usually a triangle called a
                pointer or arrow, points directly to the UI element that triggered it, creating a clear visual
                connection between the trigger and the content. The content area is the main body of the popover and can
                contain a wide variety of elements such as text labels, simple form elements, lists of actions, icons,
                and short instructions. An optional close button in the corner provides an explicit way to dismiss the
                popover, which is especially important for users with motor impairments or when the popover contains
                important actions, and optional action buttons allow users to perform primary tasks like saving or
                confirming.
            </p>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;

            margin: 0 auto;
        }

        .docs-text-container {
            display: flex;
            flex-direction: column;

            overflow-y: scroll;

            height: 344px;
            padding-left: var(--kbq-size-xl);
        }

        .kbq-button {
            align-self: center;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsPopoverExample {
    readonly popoverContent =
        'Think of a popover as a lightweight, floating window that is directly tethered to the element that summoned it. Unlike a modal dialog, it doesn\'t usually block interaction with the rest of the page entirely, allowing for a faster, more "in-context" workflow. It\'s often activated by clicking a button, icon, or link, and it disappears when the user moves their focus away.';
}
