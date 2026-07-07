import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFlag, KbqFlagSize } from '@koobiq/components/flag';
import { FlagSrcPipe } from '../flag-string.pipe';

/**
 * @title Integer flag sizes
 */
@Component({
    selector: 'flag-sizes-example',
    imports: [KbqFlag, FlagSrcPipe],
    template: `
        <div class="example-flag-row">
            @for (size of sizes; track size) {
                <kbq-flag label="Andorra" [size]="size">
                    <img alt="" [src]="'AD' | flagSrc" />
                </kbq-flag>
            }
        </div>
    `,
    styles: `
        .example-flag-row {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlagSizesExample {
    // Dimensions are multiples of a pixel so the flag edges stay crisp.
    protected readonly sizes: KbqFlagSize[] = ['24x16', '21x14', '18x12', '15x10', '12x8'];
}
