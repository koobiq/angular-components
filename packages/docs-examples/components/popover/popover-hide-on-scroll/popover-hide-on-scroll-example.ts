import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqPopoverModule } from '@koobiq/components/popover';

/**
 * @title popover-hide-on-scroll
 */
@Component({
    selector: 'popover-hide-on-scroll-example',
    imports: [CdkScrollableModule, KbqButtonModule, KbqPopoverModule],
    template: `
        <div class="popover-hide-on-scroll-example__container kbq-scrollbar" cdkScrollable>
            <div class="popover-hide-on-scroll-example__spacer">Scroll down</div>

            <div class="popover-hide-on-scroll-example__triggers">
                <button kbq-button kbqPopover kbqPopoverContent="Hides when trigger leaves the scrollable area">
                    Hides on scroll out
                </button>

                <button
                    kbq-button
                    kbqPopover
                    kbqPopoverContent="Stays open when trigger leaves the scrollable area"
                    [hideIfNotInViewPort]="false"
                >
                    Stays open on scroll out
                </button>
            </div>

            <div class="popover-hide-on-scroll-example__spacer">Scroll up</div>
        </div>
    `,
    styles: `
        .popover-hide-on-scroll-example__container {
            height: 200px;
            overflow-y: auto;
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: 4px;
        }

        .popover-hide-on-scroll-example__spacer {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 200px;
            color: var(--kbq-foreground-contrast-secondary);
        }

        .popover-hide-on-scroll-example__triggers {
            display: flex;
            gap: 16px;
            padding: 16px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverHideOnScrollExample {}
