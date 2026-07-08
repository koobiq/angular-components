import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFlag } from '@koobiq/components/flag';
import { FlagSrcPipe } from '../flag-string.pipe';

/**
 * @title Stylized flag
 */
@Component({
    selector: 'flag-stylized-example',
    imports: [KbqFlag, FlagSrcPipe],
    template: `
        <kbq-flag class="example-stylized-flag" stylized shadow="none" label="Brazil">
            <img alt="" [src]="'BR' | flagSrc" />
        </kbq-flag>
    `,
    styles: `
        :host {
            font-size: 64px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-row layout-align-center-center layout-padding-xxl'
    }
})
export class FlagStylizedExample {}
