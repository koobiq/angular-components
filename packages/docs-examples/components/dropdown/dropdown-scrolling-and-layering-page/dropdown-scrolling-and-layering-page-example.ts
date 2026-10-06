import { CdkScrollable } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqOverlayLayer } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTopBarModule } from '@koobiq/components/top-bar';

/**
 * @title Dropdown scrolling and layering page
 */
@Component({
    selector: 'dropdown-scrolling-and-layering-page-example',
    imports: [CdkScrollable, KbqButtonModule, KbqDropdownModule, KbqIconModule, KbqOverlayLayer, KbqTopBarModule],
    template: `
        <div class="example-scroller" cdkScrollable>
            <kbq-top-bar>
                <div
                    class="layout-row layout-align-center-center layout-padding-top-3xs layout-padding-bottom-3xs kbq-title kbq-truncate-line"
                    kbqTopBarContainer
                    placement="start"
                >
                    <span class="kbq-truncate-line">Page Title</span>
                </div>

                <div kbqTopBarSpacer></div>

                <div kbqTopBarContainer placement="end">
                    <button kbq-button [kbqDropdownTriggerFor]="actions">
                        Actions
                        <i kbq-icon="kbq-chevron-down-s_16"></i>
                    </button>
                </div>
            </kbq-top-bar>

            <div class="example-content" kbqOverlayLayer>
                <p>
                    Open the menu below and scroll the page: the menu follows its button and slides under the sticky
                    toolbar, while the Actions menu of the toolbar stays above it.
                </p>

                <button kbq-button [kbqDropdownTriggerFor]="menu">
                    Open menu
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>

                <p>
                    A dropdown groups actions related to one element or one place on the page. Its panel is tethered to
                    the button that opened it and moves together with that button while the page scrolls.
                </p>
                <p>
                    The content area of this page is marked with the kbqOverlayLayer directive. Panels opened from
                    inside that area render into an overlay layer of its own, which sits below the toolbar but above the
                    rest of the page content.
                </p>
                <p>
                    Panels opened from the toolbar, as well as modals, sidepanels, toasts and tooltips, stay in the
                    application-wide overlay container and keep painting above the toolbar.
                </p>
                <p>
                    The toolbar sticks to the top of the scrolling area because its inset is set to zero. Without the
                    inset a sticky toolbar lays out like a static one and scrolls away with the content.
                </p>
                <p>
                    The same approach works for a toolbar placed outside the scrolling area, and for the horizontal
                    navbar.
                </p>
            </div>
        </div>

        <kbq-dropdown #actions="kbqDropdown" xPosition="before">
            <button kbq-dropdown-item>Export</button>
            <button kbq-dropdown-item>Share</button>
            <button kbq-dropdown-item>Archive</button>
        </kbq-dropdown>

        <kbq-dropdown #menu="kbqDropdown">
            <button kbq-dropdown-item>Edit</button>
            <button kbq-dropdown-item>Duplicate</button>
            <button kbq-dropdown-item>Move to folder</button>
            <button kbq-dropdown-item>Copy link</button>
            <button kbq-dropdown-item>Delete</button>
        </kbq-dropdown>
    `,
    styles: `
        .example-scroller {
            height: 400px;
            overflow-y: auto;

            --kbq-top-bar-inset-block-start: 0;
        }

        .example-content {
            display: flex;
            flex-direction: column;
            align-items: flex-start;

            padding: 0 var(--kbq-size-xxl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownScrollingAndLayeringPageExample {}
