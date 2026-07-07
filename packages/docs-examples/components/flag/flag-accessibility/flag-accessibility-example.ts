import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFlag } from '@koobiq/components/flag';
import { FlagSrcPipe } from '../flag-string.pipe';

/**
 * @title Accessible and decorative flags
 */
@Component({
    selector: 'flag-accessibility-example',
    imports: [KbqFlag, FlagSrcPipe],
    template: `
        <div class="example-flag-list">
            <!-- Meaningful flag with no adjacent text: expose an accessible name via label. -->
            <kbq-flag label="Germany">
                <img alt="" [src]="'DE' | flagSrc" />
            </kbq-flag>

            <!-- Flag next to visible text: mark it decorative so it is hidden from screen readers. -->
            <span>
                <kbq-flag decorative>
                    <img alt="" [src]="'DE' | flagSrc" />
                </kbq-flag>
                Germany
            </span>
        </div>
    `,
    styles: `
        .example-flag-list {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
            font-size: 20px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlagAccessibilityExample {}
