import { AfterViewInit, ChangeDetectionStrategy, Component, TemplateRef, viewChild } from '@angular/core';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import { KbqPopoverComponent, KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';

@Component({
    selector: 'e2e-popover-states',
    imports: [KbqPopoverModule, KbqButton, KbqButtonCssStyler],
    template: `
        <div data-testid="e2eScreenshotTarget" class="layout-padding-l" style="width: 1300px; height: 650px">
            <ng-template #customHeader>customHeaderTemplate</ng-template>

            <ng-template #customContent>customContentTemplate</ng-template>

            <ng-template #customFooter>
                <div class="flex-100 layout-row layout-align-space-between-center">
                    <button kbq-button class="step" [color]="'contrast'">&larr; Назад</button>

                    <button kbq-button class="step" [color]="'contrast'">Дальше &rarr;</button>
                </div>
            </ng-template>

            <div kbqPopover></div>
            <div class="layout-row" style="gap: 16px">
                <kbq-popover-component #popoverSmall />
                <kbq-popover-component #popoverMedium />
                <kbq-popover-component #popoverLarge />
            </div>

            <div class="layout-row" style="gap: 16px">
                <kbq-popover-component #popoverNoArrow />
                <kbq-popover-component #popoverWithCloseButton />
                <kbq-popover-component #popoverFooterTemplate />
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2ePopoverStates'
    }
})
export class E2ePopoverStates implements AfterViewInit {
    readonly trigger = viewChild.required(KbqPopoverTrigger);
    readonly customHeader = viewChild.required<TemplateRef<any>>('customHeader');
    readonly customContent = viewChild.required<TemplateRef<any>>('customContent');
    readonly customFooter = viewChild.required<TemplateRef<any>>('customFooter');

    readonly popoverSmall = viewChild.required<KbqPopoverComponent>('popoverSmall');
    readonly popoverMedium = viewChild.required<KbqPopoverComponent>('popoverMedium');
    readonly popoverLarge = viewChild.required<KbqPopoverComponent>('popoverLarge');
    readonly popoverNoArrow = viewChild.required<KbqPopoverComponent>('popoverNoArrow');
    readonly popoverWithCloseButton = viewChild.required<KbqPopoverComponent>('popoverWithCloseButton');
    readonly popoverFooterTemplate = viewChild.required<KbqPopoverComponent>('popoverFooterTemplate');

    ngAfterViewInit(): void {
        const popoverSmall = this.popoverSmall();
        const popoverMedium = this.popoverMedium();
        const popoverLarge = this.popoverLarge();
        const popoverNoArrow = this.popoverNoArrow();
        const popoverWithCloseButton = this.popoverWithCloseButton();
        const popoverFooterTemplate = this.popoverFooterTemplate();

        const content =
            'content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content';

        popoverSmall.trigger = this.trigger();
        popoverSmall.content = 'small small small small small small small small small small small small small';
        popoverSmall.classMap = {
            'kbq-popover_small': true,
            'kbq-popover_placement-bottom': true
        };
        popoverSmall.defaultPaddings = true;
        popoverSmall.arrow = true;
        popoverSmall.show(0);

        popoverMedium.trigger = this.trigger();
        popoverMedium.header = 'medium header medium header medium header medium header medium header';
        popoverMedium.content = content;
        popoverMedium.footer = 'medium footer medium footer medium footer medium footer medium footer';
        popoverMedium.classMap = {
            'kbq-popover_medium': true,
            'kbq-popover_placement-bottom': true
        };
        popoverMedium.defaultPaddings = true;
        popoverMedium.arrow = true;
        popoverMedium.show(0);

        popoverLarge.trigger = this.trigger();
        popoverLarge.header = 'large header large header large header large header large header large header';
        popoverLarge.content = content;
        popoverLarge.footer = 'large footer large footer large footer large footer large footer large footer';
        popoverLarge.classMap = {
            'kbq-popover_large': true,
            'kbq-popover_placement-bottom': true
        };
        popoverLarge.defaultPaddings = true;
        popoverLarge.arrow = true;
        popoverLarge.show(0);

        popoverNoArrow.trigger = this.trigger();
        popoverNoArrow.header = 'header header header header header header';
        popoverNoArrow.content = 'content content content content content ';
        popoverNoArrow.footer = 'footer footer footer footer footer footer';
        popoverNoArrow.classMap = {
            'kbq-popover_medium': true,
            'kbq-popover_placement-bottom': true
        };
        popoverNoArrow.defaultPaddings = true;
        popoverNoArrow.arrow = false;
        popoverNoArrow.show(0);

        popoverWithCloseButton.trigger = this.trigger();
        popoverWithCloseButton.header = 'header header header header header header';
        popoverWithCloseButton.content = 'content content content content content ';
        popoverWithCloseButton.footer = 'footer footer footer footer footer footer';
        popoverWithCloseButton.classMap = {
            'kbq-popover_medium': true,
            'kbq-popover_placement-bottom': true
        };
        popoverWithCloseButton.defaultPaddings = true;
        popoverWithCloseButton.arrow = false;
        popoverWithCloseButton.hasCloseButton = true;
        popoverWithCloseButton.show(0);

        popoverFooterTemplate.trigger = this.trigger();
        popoverFooterTemplate.header = this.customHeader();
        popoverFooterTemplate.content = this.customContent();
        popoverFooterTemplate.footer = this.customFooter();
        popoverFooterTemplate.classMap = {
            'kbq-popover_medium': true,
            'kbq-popover_placement-bottom': true
        };
        popoverFooterTemplate.defaultPaddings = true;
        popoverFooterTemplate.arrow = false;
        popoverFooterTemplate.hasCloseButton = true;
        popoverFooterTemplate.show(0);
    }
}

@Component({
    selector: 'e2e-popover-positioning',
    imports: [KbqPopoverModule, KbqButton, KbqButtonCssStyler],
    template: `
        <div data-testid="e2eFormField" class="pin">
            <button
                data-testid="e2ePopoverTrigger"
                kbq-button
                kbqPopover
                kbqPopoverPlacement="bottom"
                kbqTrigger="click"
                kbqPopoverContent="Popover content for the trigger↔panel gap e2e."
            >
                Open (click)
            </button>
        </div>

        <div data-testid="e2eFormFieldHover" class="pin">
            <button
                data-testid="e2ePopoverTriggerHover"
                kbq-button
                kbqPopover
                kbqPopoverPlacement="bottom"
                kbqTrigger="hover"
                kbqPopoverContent="Popover content for the trigger↔panel gap e2e."
            >
                Open (hover)
            </button>
        </div>
    `,
    styles: `
        :host {
            display: block;
            width: 100vw;
            height: 100vh;
        }

        .pin {
            display: inline-block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2ePopoverPositioning'
    }
})
export class E2ePopoverPositioning {}
