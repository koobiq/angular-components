import { ChangeDetectionStrategy, Component, inject, Injector, runInInjectionContext } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';

/**
 * @title tooltip-dynamic-example
 */
@Component({
    selector: 'tooltip-dynamic-example',
    imports: [
        KbqToolTipModule,
        KbqIconModule,
        KbqTagsModule
    ],
    template: `
        <div
            class="layout-column"
            style="border: 1px solid var(--kbq-line-contrast-fade); padding: 16px; width: 300px; overflow: hidden; overflow-x: auto"
        >
            <kbq-tag style="min-width: 1000px" (mouseenter)="onMouseenter($event)" (mouseleave)="onMouseleave()">
                (users.name ILIKE '%john%' OR users.email ILIKE '%john%') OR (users.name ILIKE '%doe%' OR users.email
                ILIKE '%doe%') OR (users.name ILIKE '%developer%' OR users.bio ILIKE '%developer%')
            </kbq-tag>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipDynamicExample {
    private readonly injector = inject(Injector);

    private dynamicTooltip: KbqTooltipTrigger;

    protected onMouseenter(event) {
        if (!this.dynamicTooltip) {
            runInInjectionContext(this.injector, () => (this.dynamicTooltip = new KbqTooltipTrigger()));
        }

        this.dynamicTooltip.content = event.currentTarget.innerText;
        this.dynamicTooltip.tooltipPlacement = PopUpPlacements.Top;
        this.dynamicTooltip.showForMouseEvent(event);
    }

    protected onMouseleave() {
        this.dynamicTooltip.hide();
    }
}
