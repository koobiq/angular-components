import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip disabled
 */
@Component({
    selector: 'tooltip-disabled-for-component-example',
    imports: [KbqToolTipModule, KbqButtonModule, KbqIconModule, KbqLink],
    template: `
        <button kbq-button (click)="disableState = !disableState">toggle</button>

        <div kbqTooltip="kbq-button" [forDisabledComponent]="button">
            <button #button kbq-button [disabled]="disableState">
                <i kbq-icon="kbq-plus_16"></i>
            </button>
        </div>

        <div kbqTooltip="kbq-icon-button" [forDisabledComponent]="iconButton">
            <i #iconButton #button kbq-icon-button="kbq-plus_16" color="theme" [disabled]="disableState"></i>
        </div>

        <div kbqTooltip="kbq-link" [forDisabledComponent]="link">
            <a
                #link="kbqLink"
                kbq-link
                kbqTooltip="Create"
                href="https://koobiq.io"
                target="_blank"
                [disabled]="disableState"
            >
                kbq-link
            </a>
        </div>
    `,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center layout-gap-l'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipDisabledForComponentExample {
    disableState: boolean = false;
}
