import { Overlay } from '@angular/cdk/overlay';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_POPOVER_SCROLL_STRATEGY, KbqPopoverModule } from '@koobiq/components/popover';

/**
 * @title popover-scroll-strategy
 */
@Component({
    selector: 'popover-scroll-strategy-example',
    imports: [CdkScrollableModule, KbqButtonModule, KbqPopoverModule],
    template: `
        <div class="example-popover-scroll-strategy__container kbq-scrollbar" cdkScrollable>
            <div class="example-popover-scroll-strategy__spacer">Scroll down</div>

            <div class="example-popover-scroll-strategy__triggers">
                <button
                    kbq-button
                    kbqPopover
                    kbqPopoverContent="Repositions on scroll but never hides (reposition strategy via DI override)"
                >
                    Reposition only via DI
                </button>
            </div>

            <div class="example-popover-scroll-strategy__spacer">Scroll up</div>
        </div>
    `,
    styles: `
        .example-popover-scroll-strategy__container {
            height: 200px;
            overflow-y: auto;
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: 4px;
        }

        .example-popover-scroll-strategy__spacer {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 250px;
            color: var(--kbq-foreground-contrast-secondary);
        }

        .example-popover-scroll-strategy__triggers {
            display: flex;
            gap: 16px;
            padding: 16px;
        }
    `,
    providers: [
        {
            provide: KBQ_POPOVER_SCROLL_STRATEGY,
            useFactory: () => {
                const overlay = inject(Overlay);

                return () => overlay.scrollStrategies.reposition({ scrollThrottle: 20 });
            }
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverScrollStrategyExample {}
