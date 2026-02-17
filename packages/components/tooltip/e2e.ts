import { AfterViewInit, ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { KbqExtendedTooltipTrigger, KbqTooltipComponent, KbqTooltipTrigger } from './tooltip.component';
import { KbqToolTipModule } from './tooltip.module';

@Component({
    selector: 'e2e-tooltip-states',
    imports: [KbqToolTipModule],
    template: `
        <div data-testid="e2eScreenshotTarget" class="layout-padding-l" style="width: 1300px; height: 190px">
            <ng-template #customHeader>customHeaderTemplate</ng-template>
            <ng-template #customContent>customContentTemplate</ng-template>

            <div kbqTooltip></div>
            <div kbqExtendedTooltip></div>
            <div class="layout-row" style="gap: 16px">
                <kbq-tooltip-component #tooltipContrast />
                <kbq-tooltip-component #tooltipContrastFade />
                <kbq-tooltip-component #tooltipError />
                <kbq-tooltip-component #tooltipWarning />
            </div>

            <div class="layout-row" style="gap: 16px">
                <kbq-tooltip-component #tooltipTheme />
                <kbq-tooltip-component #tooltipNoArrow />
                <kbq-tooltip-component #tooltipTemplates />
                <kbq-tooltip-component #tooltipExtended />
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTooltipStates'
    }
})
export class E2eTooltipStates implements AfterViewInit {
    @ViewChild(KbqTooltipTrigger) trigger: KbqTooltipTrigger;
    @ViewChild(KbqExtendedTooltipTrigger) extendedTooltipTrigger: KbqExtendedTooltipTrigger;
    @ViewChild('customHeader') customHeader: TemplateRef<any>;
    @ViewChild('customContent') customContent: TemplateRef<any>;

    @ViewChild('tooltipContrast') tooltipContrast: KbqTooltipComponent;
    @ViewChild('tooltipContrastFade') tooltipContrastFade: KbqTooltipComponent;
    @ViewChild('tooltipError') tooltipError: KbqTooltipComponent;
    @ViewChild('tooltipWarning') tooltipWarning: KbqTooltipComponent;
    @ViewChild('tooltipTheme') tooltipTheme: KbqTooltipComponent;
    @ViewChild('tooltipExtended') tooltipExtended: KbqTooltipComponent;

    @ViewChild('tooltipNoArrow') tooltipNoArrow: KbqTooltipComponent;
    @ViewChild('tooltipTemplates') tooltipTemplates: KbqTooltipComponent;

    ngAfterViewInit(): void {
        const header = 'header header header header header header header header header header header';
        const content = 'content content content content content content content content content content content';

        this.tooltipContrast.trigger = this.trigger;
        this.tooltipContrast.header = header;
        this.tooltipContrast.content = content;

        this.tooltipContrast.classMap = {
            'kbq-tooltip_placement-bottom': true,
            'kbq-contrast': true
        };
        this.tooltipContrast.arrow = true;
        this.tooltipContrast.offset = null;
        this.tooltipContrast.show(0);

        this.tooltipContrastFade.trigger = this.trigger;
        this.tooltipContrastFade.header = header;
        this.tooltipContrastFade.content = content;

        this.tooltipContrastFade.classMap = {
            'kbq-tooltip_placement-bottom': true,
            'kbq-contrast-fade': true
        };
        this.tooltipContrastFade.arrow = true;
        this.tooltipContrastFade.offset = null;
        this.tooltipContrastFade.show(0);

        this.tooltipError.trigger = this.trigger;
        this.tooltipError.header = header;
        this.tooltipError.content = content;

        this.tooltipError.classMap = {
            'kbq-tooltip_placement-bottom': true,
            'kbq-error': true
        };
        this.tooltipError.arrow = true;
        this.tooltipError.offset = null;

        this.tooltipError.show(0);

        this.tooltipWarning.trigger = this.trigger;
        this.tooltipWarning.header = header;
        this.tooltipWarning.content = content;

        this.tooltipWarning.classMap = {
            'kbq-tooltip_placement-bottom': true,
            'kbq-warning': true
        };
        this.tooltipWarning.arrow = true;
        this.tooltipWarning.offset = null;
        this.tooltipWarning.show(0);

        this.tooltipTheme.trigger = this.trigger;
        this.tooltipTheme.header = header;
        this.tooltipTheme.content = content;

        this.tooltipTheme.classMap = {
            'kbq-tooltip_placement-bottom': true,
            'kbq-theme': true
        };
        this.tooltipTheme.arrow = true;
        this.tooltipTheme.offset = null;
        this.tooltipTheme.show(0);

        this.tooltipNoArrow.trigger = this.trigger;
        this.tooltipNoArrow.header = header;
        this.tooltipNoArrow.content = content;

        this.tooltipNoArrow.classMap = {
            'kbq-tooltip_placement-bottom': true,
            'kbq-contrast-fade': true
        };
        this.tooltipNoArrow.arrow = false;
        this.tooltipNoArrow.offset = null;
        this.tooltipNoArrow.show(0);

        this.tooltipTemplates.trigger = this.trigger;
        this.tooltipTemplates.header = this.customHeader;
        this.tooltipTemplates.content = this.customContent;

        this.tooltipTemplates.classMap = {
            'kbq-tooltip_placement-bottom': true,
            'kbq-contrast-fade': true
        };
        this.tooltipTemplates.arrow = false;
        this.tooltipTemplates.offset = null;
        this.tooltipTemplates.show(0);

        this.tooltipExtended.trigger = this.extendedTooltipTrigger;
        this.tooltipExtended.header = header;
        this.tooltipExtended.content = content;
        (this.extendedTooltipTrigger as any).instance = this.tooltipExtended;
        this.extendedTooltipTrigger.updateClassMap();

        this.tooltipExtended.arrow = false;
        this.tooltipExtended.offset = null;
        this.tooltipExtended.show(0);
    }
}
