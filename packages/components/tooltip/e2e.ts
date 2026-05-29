import { AfterViewInit, ChangeDetectionStrategy, Component, TemplateRef, viewChild } from '@angular/core';
import { KbqTooltipComponent, KbqTooltipTrigger } from './tooltip.component';
import { KbqToolTipModule } from './tooltip.module';

@Component({
    selector: 'e2e-tooltip-arrow-offset',
    imports: [KbqToolTipModule],
    template: `
        <div
            data-testid="tooltipWithArrow"
            [kbqTooltip]="'with-arrow'"
            [kbqTooltipArrow]="true"
            [kbqPlacement]="'bottom'"
        >
            trigger-with-arrow
        </div>
        <div
            data-testid="tooltipWithoutArrow"
            [kbqTooltip]="'without-arrow'"
            [kbqTooltipArrow]="false"
            [kbqPlacement]="'bottom'"
        >
            trigger-without-arrow
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTooltipArrowOffset'
    }
})
export class E2eTooltipArrowOffset {}

@Component({
    selector: 'e2e-tooltip-states',
    imports: [KbqToolTipModule],
    template: `
        <div data-testid="e2eScreenshotTarget" class="layout-padding-l" style="width: 1300px; height: 190px">
            <ng-template #customHeader>customHeaderTemplate</ng-template>
            <ng-template #customContent>customContentTemplate</ng-template>

            <div kbqTooltip></div>
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
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTooltipStates'
    }
})
export class E2eTooltipStates implements AfterViewInit {
    readonly trigger = viewChild.required(KbqTooltipTrigger);
    readonly customHeader = viewChild.required<TemplateRef<any>>('customHeader');
    readonly customContent = viewChild.required<TemplateRef<any>>('customContent');

    readonly tooltipContrast = viewChild.required<KbqTooltipComponent>('tooltipContrast');
    readonly tooltipContrastFade = viewChild.required<KbqTooltipComponent>('tooltipContrastFade');
    readonly tooltipError = viewChild.required<KbqTooltipComponent>('tooltipError');
    readonly tooltipWarning = viewChild.required<KbqTooltipComponent>('tooltipWarning');
    readonly tooltipTheme = viewChild.required<KbqTooltipComponent>('tooltipTheme');

    readonly tooltipNoArrow = viewChild.required<KbqTooltipComponent>('tooltipNoArrow');
    readonly tooltipTemplates = viewChild.required<KbqTooltipComponent>('tooltipTemplates');

    ngAfterViewInit(): void {
        const header = 'header header header header header header header header header header header';
        const content = 'content content content content content content content content content content content';

        const tooltipContrast = this.tooltipContrast();
        const tooltipContrastFade = this.tooltipContrastFade();
        const tooltipError = this.tooltipError();
        const tooltipWarning = this.tooltipWarning();
        const tooltipTheme = this.tooltipTheme();
        const tooltipNoArrow = this.tooltipNoArrow();
        const tooltipTemplates = this.tooltipTemplates();

        tooltipContrast.trigger = this.trigger();
        tooltipContrast.header = header;
        tooltipContrast.content = content;

        tooltipContrast.classMap = {
            'kbq-tooltip_placement-bottom': true,
            'kbq-contrast': true
        };
        tooltipContrast.arrow = true;
        tooltipContrast.offset = null;
        tooltipContrast.show(0);

        tooltipContrastFade.trigger = this.trigger();
        tooltipContrastFade.header = header;
        tooltipContrastFade.content = content;

        tooltipContrastFade.classMap = {
            'kbq-tooltip_placement-bottom': true,
            'kbq-contrast-fade': true
        };
        tooltipContrastFade.arrow = true;
        tooltipContrastFade.offset = null;
        tooltipContrastFade.show(0);

        tooltipError.trigger = this.trigger();
        tooltipError.header = header;
        tooltipError.content = content;

        tooltipError.classMap = {
            'kbq-tooltip_placement-bottom': true,
            'kbq-error': true
        };
        tooltipError.arrow = true;
        tooltipError.offset = null;

        tooltipError.show(0);

        tooltipWarning.trigger = this.trigger();
        tooltipWarning.header = header;
        tooltipWarning.content = content;

        tooltipWarning.classMap = {
            'kbq-tooltip_placement-bottom': true,
            'kbq-warning': true
        };
        tooltipWarning.arrow = true;
        tooltipWarning.offset = null;
        tooltipWarning.show(0);

        tooltipTheme.trigger = this.trigger();
        tooltipTheme.header = header;
        tooltipTheme.content = content;

        tooltipTheme.classMap = {
            'kbq-tooltip_placement-bottom': true,
            'kbq-theme': true
        };
        tooltipTheme.arrow = true;
        tooltipTheme.offset = null;
        tooltipTheme.show(0);

        tooltipNoArrow.trigger = this.trigger();
        tooltipNoArrow.header = header;
        tooltipNoArrow.content = content;

        tooltipNoArrow.classMap = {
            'kbq-tooltip_placement-bottom': true,
            'kbq-contrast-fade': true
        };
        tooltipNoArrow.arrow = false;
        tooltipNoArrow.offset = null;
        tooltipNoArrow.show(0);

        tooltipTemplates.trigger = this.trigger();
        tooltipTemplates.header = this.customHeader();
        tooltipTemplates.content = this.customContent();

        tooltipTemplates.classMap = {
            'kbq-tooltip_placement-bottom': true,
            'kbq-contrast-fade': true
        };
        tooltipTemplates.arrow = false;
        tooltipTemplates.offset = null;
        tooltipTemplates.show(0);
    }
}
