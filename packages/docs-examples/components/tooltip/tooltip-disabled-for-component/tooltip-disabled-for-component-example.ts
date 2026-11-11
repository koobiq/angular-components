import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { injectExampleText } from '../l10n';

/**
 * @title Tooltip disabled
 */
@Component({
    selector: 'tooltip-disabled-for-component-example',
    imports: [KbqToolTipModule, KbqButtonModule, KbqIconModule, KbqLink],
    template: `
        <button kbq-button (click)="disableState = !disableState">{{ text().toggle }}</button>

        <div kbqTooltip="kbq-button" [forDisabledComponent]="button">
            <button #button kbq-button [attr.aria-label]="text().add" [disabled]="disableState">
                <i kbq-icon="kbq-plus_16"></i>
            </button>
        </div>

        <div kbqTooltip="kbq-icon-button" [forDisabledComponent]="iconButton">
            <i #iconButton #button kbq-icon-button="kbq-plus_16" color="theme" [disabled]="disableState"></i>
        </div>

        <div kbqTooltip="kbqLink" [forDisabledComponent]="link">
            <a
                #link="kbqLink"
                kbqLink
                href="https://koobiq.io"
                target="_blank"
                [kbqTooltip]="text().create"
                [disabled]="disableState"
            >
                kbq-link
            </a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center layout-gap-l'
    }
})
export class TooltipDisabledForComponentExample {
    protected readonly text = injectExampleText();

    disableState: boolean = false;
}
