import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFlag } from '@koobiq/components/flag';
import { FlagSvgPipe } from '../flag-string.pipe';

/**
 * @title Stylized flag
 */
@Component({
    selector: 'flag-stylized-example',
    imports: [KbqFlag, FlagSvgPipe],
    template: `
        <kbq-flag stylized shadow="none" label="Brazil" [innerHTML]="'BR' | flagSvg" />
    `,
    styles: `
        .kbq-flag {
            font-size: 64px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-row layout-align-center-center layout-padding-xxl'
    }
})
export class FlagStylizedExample {}
