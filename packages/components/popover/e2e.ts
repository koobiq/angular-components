import { AfterViewInit, ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import { KbqPopoverComponent, KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';

@Component({
    selector: 'e2e-popover-states',
    imports: [KbqPopoverModule, KbqButton, KbqButtonCssStyler],
    template: `
        <div data-testid="e2eScreenshotTarget" class="layout-padding-l" style="width: 1300px; height: 620px">
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
    @ViewChild(KbqPopoverTrigger) trigger: KbqPopoverTrigger;
    @ViewChild('customHeader') customHeader: TemplateRef<any>;
    @ViewChild('customContent') customContent: TemplateRef<any>;
    @ViewChild('customFooter') customFooter: TemplateRef<any>;

    @ViewChild('popoverSmall') popoverSmall: KbqPopoverComponent;
    @ViewChild('popoverMedium') popoverMedium: KbqPopoverComponent;
    @ViewChild('popoverLarge') popoverLarge: KbqPopoverComponent;
    @ViewChild('popoverNoArrow') popoverNoArrow: KbqPopoverComponent;
    @ViewChild('popoverWithCloseButton') popoverWithCloseButton: KbqPopoverComponent;
    @ViewChild('popoverFooterTemplate') popoverFooterTemplate: KbqPopoverComponent;

    ngAfterViewInit(): void {
        const content =
            'content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content content';

        this.popoverSmall.trigger = this.trigger;
        this.popoverSmall.content = 'small small small small small small small small small small small small small';
        this.popoverSmall.classMap = {
            'kbq-popover_small': true,
            'kbq-popover_placement-bottom': true
        };
        this.popoverSmall.defaultPaddings = true;
        this.popoverSmall.arrow = true;
        this.popoverSmall.show(0);

        this.popoverMedium.trigger = this.trigger;
        this.popoverMedium.header = 'medium header medium header medium header medium header medium header';
        this.popoverMedium.content = content;
        this.popoverMedium.footer = 'medium footer medium footer medium footer medium footer medium footer';
        this.popoverMedium.classMap = {
            'kbq-popover_medium': true,
            'kbq-popover_placement-bottom': true
        };
        this.popoverMedium.defaultPaddings = true;
        this.popoverMedium.arrow = true;
        this.popoverMedium.show(0);

        this.popoverLarge.trigger = this.trigger;
        this.popoverLarge.header = 'large header large header large header large header large header large header';
        this.popoverLarge.content = content;
        this.popoverLarge.footer = 'large footer large footer large footer large footer large footer large footer';
        this.popoverLarge.classMap = {
            'kbq-popover_large': true,
            'kbq-popover_placement-bottom': true
        };
        this.popoverLarge.defaultPaddings = true;
        this.popoverLarge.arrow = true;
        this.popoverLarge.show(0);

        this.popoverNoArrow.trigger = this.trigger;
        this.popoverNoArrow.header = 'header header header header header header';
        this.popoverNoArrow.content = 'content content content content content ';
        this.popoverNoArrow.footer = 'footer footer footer footer footer footer';
        this.popoverNoArrow.classMap = {
            'kbq-popover_medium': true,
            'kbq-popover_placement-bottom': true
        };
        this.popoverNoArrow.defaultPaddings = true;
        this.popoverNoArrow.arrow = false;
        this.popoverNoArrow.show(0);

        this.popoverWithCloseButton.trigger = this.trigger;
        this.popoverWithCloseButton.header = 'header header header header header header';
        this.popoverWithCloseButton.content = 'content content content content content ';
        this.popoverWithCloseButton.footer = 'footer footer footer footer footer footer';
        this.popoverWithCloseButton.classMap = {
            'kbq-popover_medium': true,
            'kbq-popover_placement-bottom': true
        };
        this.popoverWithCloseButton.defaultPaddings = true;
        this.popoverWithCloseButton.arrow = false;
        this.popoverWithCloseButton.hasCloseButton = true;
        this.popoverWithCloseButton.show(0);

        this.popoverFooterTemplate.trigger = this.trigger;
        this.popoverFooterTemplate.header = this.customHeader;
        this.popoverFooterTemplate.content = this.customContent;
        this.popoverFooterTemplate.footer = this.customFooter;
        this.popoverFooterTemplate.classMap = {
            'kbq-popover_medium': true,
            'kbq-popover_placement-bottom': true
        };
        this.popoverFooterTemplate.defaultPaddings = true;
        this.popoverFooterTemplate.arrow = false;
        this.popoverFooterTemplate.hasCloseButton = true;
        this.popoverFooterTemplate.show(0);
    }
}
